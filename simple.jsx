import React, { useState, useEffect, useRef } from 'react';

function SimpleComponent() {
    const [task, setTask] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [steps, setSteps] = useState([]);
    const [progressStatus, setProgressStatus] = useState('');
    const [executionLog, setExecutionLog] = useState([]);
    const logEndRef = useRef(null);
    
    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [executionLog]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSteps([]);
        setExecutionLog([]);
        setProgressStatus('Starting automation...');
        
        try {
            // Add initial log entry
            addLogEntry('INFO', 'Starting validation...');
            
            // Validate first
            const validation = await fetch('http://localhost:8000/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: task })
            });
            const validationResult = await validation.json();

            // if (!validationResult.valid) {
            //     addLogEntry('ERROR', `Invalid task: ${validationResult.reason}`);
            //     alert(`Invalid task: ${validationResult.reason}`);
            //     setLoading(false);
            //     return;
            // }
            
            addLogEntry('SUCCESS', 'Validation successful. Starting automation...');
            setProgressStatus('Running automation...');

            // Set up event source for streaming updates if supported
            // Otherwise poll for updates every second
            const eventSource = setupProgressUpdates();
            
            // Run automation
            const response = await fetch('http://localhost:8000/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: task,
                    timeout: 120,
                    headless: false,
                    max_steps: 50
                })
            });

            // Close event source if it was created
            if (eventSource) eventSource.close();
            
            const automationResult = await response.json();
            setResult(automationResult);
            
            // Add final log entry
            if (automationResult.success) {
                addLogEntry('SUCCESS', 'Automation completed successfully');
                setProgressStatus('Completed successfully');
            } else {
                addLogEntry('ERROR', `Automation failed: ${automationResult.message}`);
                setProgressStatus('Failed');
            }
        } catch (error) {
            console.error('Error:', error);
            addLogEntry('ERROR', `Error executing automation: ${error.message}`);
            setProgressStatus('Error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    // Setup progress updates via polling
    const setupProgressUpdates = () => {
        // If server supports SSE, use it
        if (window.EventSource) {
            try {
                const eventSource = new EventSource('http://localhost:8000/stream-progress');
                
                eventSource.addEventListener('step', (event) => {
                    const data = JSON.parse(event.data);
                    addStepUpdate(data);
                });
                  eventSource.addEventListener('log', (event) => {
                    const data = JSON.parse(event.data);
                    addLogEntry(data.level || 'INFO', data.message);
                });
                
                // Listen for agent logs specifically
                eventSource.addEventListener('agent_log', (event) => {
                    const data = JSON.parse(event.data);
                    addLogEntry('INFO', data.message || data);
                });
                
                // Listen for raw log messages
                eventSource.addEventListener('message', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'log' && data.message) {
                            addLogEntry(data.level || 'INFO', data.message);
                        } else if (data.type === 'step' && data.step) {
                            addStepUpdate(data.step);
                        }
                    } catch (e) {
                        // If it's not JSON, treat as raw log message
                        addLogEntry('INFO', event.data);
                    }
                });
                
                eventSource.onerror = () => {
                    eventSource.close();
                    startPolling();
                };
                
                return eventSource;
            } catch (e) {
                console.warn('SSE failed, falling back to polling', e);
                startPolling();
                return null;
            }
        } else {
            startPolling();
            return null;
        }
    };
      // Fallback to polling for progress updates
    const startPolling = () => {
        const pollInterval = setInterval(async () => {
            if (!loading) {
                clearInterval(pollInterval);
                return;
            }
            
            try {
                const response = await fetch('http://localhost:8000/progress');
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.steps && data.steps.length > 0) {
                        setSteps(data.steps);
                    }
                    
                    if (data.logs && data.logs.length > 0) {
                        setExecutionLog(data.logs);
                    }
                    
                    // Handle real-time log messages from backend
                    if (data.recent_logs && Array.isArray(data.recent_logs)) {
                        data.recent_logs.forEach(logMessage => {
                            // Add each log message with appropriate parsing
                            addLogEntry('INFO', logMessage);
                        });
                    }
                    
                    // Handle agent output directly
                    if (data.agent_output) {
                        // Split agent output into individual log lines
                        const logLines = data.agent_output.split('\n').filter(line => line.trim());
                        logLines.forEach(line => {
                            if (line.includes('INFO [agent]') || line.includes('INFO [controller]') || line.includes('INFO [testserver]')) {
                                const messageMatch = line.match(/INFO \[.*?\] (.+)/);
                                if (messageMatch) {
                                    addLogEntry('INFO', messageMatch[1]);
                                }
                            }
                        });
                    }
                    
                    // Update progress status if available
                    if (data.status) {
                        setProgressStatus(data.status);
                    }
                }
            } catch (e) {
                console.error('Error polling for updates', e);
            }
        }, 1000);
        
        return () => clearInterval(pollInterval);
    };
    
    const addStepUpdate = (stepData) => {
        setSteps(prevSteps => [...prevSteps, stepData]);
    };
    
    const addLogEntry = (level, message) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, level, message };
        setExecutionLog(prevLog => [...prevLog, logEntry]);
        
        // Parse agent steps from log messages and convert to step format
        if (message.includes('📍 Step')) {
            const stepMatch = message.match(/📍 Step (\d+)/);
            if (stepMatch) {
                const stepNumber = stepMatch[1];
                const stepData = {
                    id: stepNumber,
                    stepNumber: stepNumber,
                    description: `Step ${stepNumber}`,
                    status: 'running',
                    timestamp: timestamp
                };
                setSteps(prevSteps => {
                    const existingStepIndex = prevSteps.findIndex(s => s.id === stepNumber);
                    if (existingStepIndex >= 0) {
                        return prevSteps.map((s, i) => i === existingStepIndex ? {...s, ...stepData} : s);
                    } else {
                        return [...prevSteps, stepData];
                    }
                });
            }
        }
        
        // Parse goal information
        if (message.includes('🎯 Next goal:')) {
            const goalMatch = message.match(/🎯 Next goal: (.+)/);
            if (goalMatch) {
                const goal = goalMatch[1];
                setSteps(prevSteps => {
                    const lastStep = prevSteps[prevSteps.length - 1];
                    if (lastStep) {
                        const updatedStep = {
                            ...lastStep,
                            goal: goal,
                            description: goal,
                            status: 'running'
                        };
                        return [...prevSteps.slice(0, -1), updatedStep];
                    }
                    return prevSteps;
                });
            }
        }
        
        // Parse action information
        if (message.includes('🛠️ Action')) {
            const actionMatch = message.match(/🛠️ Action \d+\/\d+: (.+)/);
            if (actionMatch) {
                try {
                    const actionData = JSON.parse(actionMatch[1]);
                    setSteps(prevSteps => {
                        const lastStep = prevSteps[prevSteps.length - 1];
                        if (lastStep) {
                            const updatedStep = {
                                ...lastStep,
                                action: actionData,
                                status: 'running'
                            };
                            return [...prevSteps.slice(0, -1), updatedStep];
                        }
                        return prevSteps;
                    });
                } catch (e) {
                    // If JSON parsing fails, just store the raw action
                    setSteps(prevSteps => {
                        const lastStep = prevSteps[prevSteps.length - 1];
                        if (lastStep) {
                            const updatedStep = {
                                ...lastStep,
                                action: actionMatch[1],
                                status: 'running'
                            };
                            return [...prevSteps.slice(0, -1), updatedStep];
                        }
                        return prevSteps;
                    });
                }
            }
        }
        
        // Parse evaluation results
        if (message.includes('👍 Eval: Success') || message.includes('🤷 Eval: Unknown')) {
            const evalMatch = message.match(/(👍|🤷) Eval: (.+)/);
            if (evalMatch) {
                const evalResult = evalMatch[2];
                const isSuccess = evalMatch[1] === '👍';
                setSteps(prevSteps => {
                    const lastStep = prevSteps[prevSteps.length - 1];
                    if (lastStep) {
                        const updatedStep = {
                            ...lastStep,
                            evaluation: evalResult,
                            status: isSuccess ? 'success' : 'warning'
                        };
                        return [...prevSteps.slice(0, -1), updatedStep];
                    }
                    return prevSteps;
                });
            }
        }
        
        // Parse memory/progress information
        if (message.includes('🧠 Memory:')) {
            const memoryMatch = message.match(/🧠 Memory: (.+)/);
            if (memoryMatch) {
                const memory = memoryMatch[1];
                setSteps(prevSteps => {
                    const lastStep = prevSteps[prevSteps.length - 1];
                    if (lastStep) {
                        const updatedStep = {
                            ...lastStep,
                            memory: memory
                        };
                        return [...prevSteps.slice(0, -1), updatedStep];
                    }
                    return prevSteps;
                });
            }
        }
        
        // Parse controller actions (like navigation, clicks, input)
        if (message.includes('🔗 Navigated to') || message.includes('🖱️ Clicked') || message.includes('⌨️ Input')) {
            setSteps(prevSteps => {
                const lastStep = prevSteps[prevSteps.length - 1];
                if (lastStep) {
                    const updatedStep = {
                        ...lastStep,
                        controllerAction: message,
                        status: 'success'
                    };
                    return [...prevSteps.slice(0, -1), updatedStep];
                }
                return prevSteps;
            });
        }
        
        // Parse final completion
        if (message.includes('✅ Task completed') || message.includes('✅ Successfully')) {
            setSteps(prevSteps => {
                return prevSteps.map(step => ({
                    ...step,
                    status: 'success'
                }));
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Web Automation Studio</h1>
                    <p className="text-gray-600">Create and run automated web tasks with natural language</p>
                </div>

                {/* Main Card */}
                <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
                    <div className="relative p-6 md:p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">Describe Your Task</label>
                                <textarea
                                    value={task}
                                    onChange={(e) => setTask(e.target.value)}
                                    placeholder="e.g., Go to example.com, fill out the login form with username 'testuser' and password 'password123', then click the login button."
                                    rows={5}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                />
                                <p className="mt-2 text-sm text-gray-500">Be specific about what actions you want the automation to perform.</p>
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className={`group relative overflow-hidden px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center space-x-2 ${
                                        loading 
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Running Automation...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Run Automation</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Live Execution Panel */}
                {loading && (
                    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
                        <div className="relative p-6 md:p-8">                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Live Execution</h2>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-gray-700 font-medium">{progressStatus}</span>
                                </div>
                            </div>
                            
                            {/* Current Step Indicator */}
                            {steps.length > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-blue-800">
                                            Currently executing: {steps[steps.length - 1]?.description || steps[steps.length - 1]?.goal || 'Processing...'}
                                        </span>
                                    </div>
                                    {steps[steps.length - 1]?.status === 'running' && steps[steps.length - 1]?.action && (
                                        <div className="mt-1 text-xs text-blue-600">
                                            Action: {typeof steps[steps.length - 1].action === 'object' 
                                                ? Object.keys(steps[steps.length - 1].action)[0] 
                                                : steps[steps.length - 1].action}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Execution Steps</h3>                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                                    {steps.length > 0 ? (
                                        <ol className="space-y-3 pl-5 list-decimal">
                                            {steps.map((step, index) => (
                                                <li key={step.id || index} className="text-gray-800">
                                                    <div className="border-l-2 border-blue-200 pl-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="font-medium text-gray-900">
                                                                Step {step.stepNumber || index + 1}: {step.goal || step.description}
                                                            </div>
                                                            <div className={`text-xs px-2 py-1 rounded-full ${
                                                                step.status === 'success' ? 'bg-green-100 text-green-700' : 
                                                                step.status === 'error' ? 'bg-red-100 text-red-700' :
                                                                step.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {step.status === 'success' ? '✅ Complete' :
                                                                 step.status === 'error' ? '❌ Error' :
                                                                 step.status === 'warning' ? '⚠️ Warning' :
                                                                 '🔄 Running'}
                                                            </div>
                                                        </div>
                                                        
                                                        {step.action && (
                                                            <div className="text-sm text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                                                                <strong>Action:</strong> {typeof step.action === 'object' 
                                                                    ? JSON.stringify(step.action, null, 2) 
                                                                    : step.action}
                                                            </div>
                                                        )}
                                                        
                                                        {step.evaluation && (
                                                            <div className="text-sm text-blue-600 mt-1">
                                                                <strong>Evaluation:</strong> {step.evaluation}
                                                            </div>
                                                        )}
                                                        
                                                        {step.controllerAction && (
                                                            <div className="text-sm text-green-600 mt-1">
                                                                <strong>Result:</strong> {step.controllerAction}
                                                            </div>
                                                        )}
                                                        
                                                        {step.memory && (
                                                            <div className="text-xs text-gray-500 mt-1 italic">
                                                                Progress: {step.memory}
                                                            </div>
                                                        )}
                                                        
                                                        {step.timestamp && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {step.timestamp}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">
                                            <p>Waiting for first step...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Execution Log</h3>                                <div className="bg-gray-900 text-gray-100 font-mono text-xs rounded-xl p-4 max-h-60 overflow-y-auto">
                                    {executionLog.map((entry, index) => (
                                        <div key={index} className={`mb-1 ${
                                            entry.level === 'ERROR' ? 'text-red-400' : 
                                            entry.level === 'SUCCESS' ? 'text-green-400' : 
                                            entry.level === 'INFO' ? 'text-blue-400' : 
                                            entry.message.includes('📍') ? 'text-yellow-400 font-bold' :
                                            entry.message.includes('🎯') ? 'text-purple-400' :
                                            entry.message.includes('🛠️') ? 'text-orange-400' :
                                            entry.message.includes('👍') ? 'text-green-400' :
                                            entry.message.includes('🧠') ? 'text-cyan-400' :
                                            entry.message.includes('🔗') || entry.message.includes('🖱️') || entry.message.includes('⌨️') ? 'text-blue-300' :
                                            entry.message.includes('✅') ? 'text-green-300 font-bold' :
                                            'text-gray-400'
                                        }`}>
                                            [{entry.timestamp}] {entry.level}: {entry.message}
                                        </div>
                                    ))}
                                    <div ref={logEndRef} />
                                    {executionLog.length === 0 && (
                                        <div className="text-gray-500">
                                            Waiting for log entries...
                                        </div>
                                    )}
                                    <div ref={logEndRef} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Panel */}
                {result && (
                    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/50"></div>
                        <div className="relative p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Automation Results</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className={`flex items-center p-4 rounded-xl ${result.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {result.success ? 
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        }
                                    </div>
                                    <div>
                                        <p className="font-medium">Status</p>
                                        <p className={`text-sm ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {result.success ? 'Completed Successfully' : 'Failed'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">Execution Time</p>
                                        <p className="text-sm text-blue-700">{result.execution_time} seconds</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-2">Message</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p className="text-gray-800">{result.message}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Steps Taken</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {result.steps_taken}
                                        </div>
                                        <p className="text-gray-800">steps completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SimpleComponent;