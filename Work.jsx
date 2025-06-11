import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Trash2, Settings, Code, FileText, Eye, MoreVertical, X, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Command, Clock, Check, AlertCircle, Search, ChevronDown, ChevronUp, Layout, Database, Copy, Download, Zap, Target, Send, Bot, Wand2, BookOpen } from 'lucide-react';

const Recorder = () => {
  // Core state
  const [recordingState, setRecordingState] = useState('stopped'); 
  const [activeScenario, setActiveScenario] = useState('shop-bling');
  
  // Steps and parameters
  const [steps, setSteps] = useState([
    {
      id: 1,
      type: 'given',
      description: 'The user logs in with username "username" and password "password"',
      element: 'Login Form',
      status: 'completed',
      isParameterized: true
    },
    {
      id: 2,
      type: 'action',
      description: 'Fill Input: Username',
      element: '<username>',
      status: 'completed'
    },
    {
      id: 3,
      type: 'action', 
      description: 'Fill Input: Password',
      element: '<password>',
      status: 'completed'
    },
    {
      id: 4,
      type: 'action',
      description: 'Click Element: Button Login',
      element: 'Button: Login',
      status: 'completed'
    }
  ]);

  const [parameters, setParameters] = useState([
    { name: 'username', value: 'bling_user', type: 'string' },
    { name: 'password', value: 'let_me_in', type: 'string' }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('parameters');
  const [isExamplesPanelOpen, setIsExamplesPanelOpen] = useState(false);

  // Taskbar tabs
  const [taskbarTabs] = useState([
    { id: 'recorder', title: 'Test Recorder', icon: Play, pinned: true },
    { id: 'nlp-commands', title: 'NLP Commands', icon: Wand2, pinned: true },
    { id: 'ai-chat', title: 'AI Assistant', icon: Bot, pinned: true }
  ]);
  const [activeTaskbarTab, setActiveTaskbarTab] = useState('recorder');

  // Chat and NLP state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Welcome to Scout AI! How can I assist you today?", sender: "bot", timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [nlpCommand, setNlpCommand] = useState("");
  const [nlpHistory, setNlpHistory] = useState([
    { id: 1, command: "Click on the login button", generated: "await page.click('[data-testid=\"login-btn\"]')", timestamp: new Date() }
  ]);

  // Handlers
  const handleRecordingToggle = () => {
    if (recordingState === 'stopped') {
      setRecordingState('recording');
    } else if (recordingState === 'recording') {
      setRecordingState('paused');
    } else {
      setRecordingState('recording');
    }
  };

  const handleStop = () => {
    setRecordingState('stopped');
  };

  const addParameter = () => {
    const newParam = {
      name: `param${parameters.length + 1}`,
      value: 'value',
      type: 'string'
    };
    setParameters([...parameters, newParam]);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index, field, value) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const handleChatSend = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        text: chatInput,
        sender: "user",
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput("");
      
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          text: "I understand you need help with that. Let me analyze your request and provide the best solution.",
          sender: "bot",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1500);
    }
  };

  const handleNlpCommand = () => {
    if (nlpCommand.trim()) {
      const newCommand = {
        id: nlpHistory.length + 1,
        command: nlpCommand,
        generated: `// Generated from: "${nlpCommand}"\nawait page.locator('selector').click();`,
        timestamp: new Date()
      };
      setNlpHistory([newCommand, ...nlpHistory]);
      setNlpCommand("");
    }
  };

  const switchTaskbarTab = (tabId) => {
    setActiveTaskbarTab(tabId);
  };

  // Utility functions
  const getStepIcon = (type) => {
    switch (type) {
      case 'given':
        return <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">G</div>;
      case 'action':
        return <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Zap className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-lg"></div>;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Check },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </div>
    );
  };

  // Render functions
  const renderTabContent = () => {
    switch (activeTaskbarTab) {
      case 'recorder':
        return renderRecorderContent();
      case 'nlp-commands':
        return renderNLPCommandsContent();
      case 'ai-chat':
        return renderAIChatContent();
      default:
        return renderRecorderContent();
    }
  };
  const renderRecorderContent = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Recording Controls */}
      <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Recording Studio</h2>
              <p className="text-sm lg:text-base text-gray-600">Control your test automation recording session</p>
            </div>
            {recordingState === 'recording' && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-3 lg:px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-medium text-sm">LIVE RECORDING</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 lg:gap-4">
            <button
              onClick={handleRecordingToggle}
              className={`group relative overflow-hidden px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto ${
                recordingState === 'recording' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
              }`}
            >
              {recordingState === 'recording' ? <Pause className="w-4 h-4 lg:w-5 lg:h-5" /> : <Play className="w-4 h-4 lg:w-5 lg:h-5" />}
              <span className="font-semibold text-sm lg:text-base">
                {recordingState === 'recording' ? 'Pause' : recordingState === 'paused' ? 'Resume' : 'Run Scenario'}
              </span>
            </button>
            
            <button
              onClick={handleStop}
              className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-medium shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto"
            >
              <Square className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="font-semibold text-sm lg:text-base">Stop</span>
            </button>

            <button
              onClick={() => setIsExamplesPanelOpen(!isExamplesPanelOpen)}
              className="sm:ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-medium shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto"
            >
              <Database className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Test Data</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isExamplesPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>      {/* Steps List */}
      <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/50"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Test Execution Flow</h2>
              <p className="text-sm lg:text-base text-gray-600">{steps.length} automated steps recorded</p>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="group relative overflow-hidden bg-white/80 backdrop-blur rounded-xl lg:rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="relative flex items-start p-4 lg:p-6">
                  <div className="flex-shrink-0 mr-4 lg:mr-6">
                    {getStepIcon(step.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 lg:mb-3 gap-2">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <span className="text-xs lg:text-sm font-bold text-blue-600 bg-blue-50 px-2 lg:px-3 py-1 rounded-lg">
                          {step.type === 'given' ? 'GIVEN' : `STEP ${index + 1}`}
                        </span>
                        {getStatusBadge(step.status)}
                      </div>
                    </div>
                    
                    <p className="text-sm lg:text-base text-gray-900 font-medium mb-2 leading-relaxed">{step.description}</p>
                    
                    {step.element && (
                      <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
                        <Target className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>Target: <code className="bg-gray-100 px-1 lg:px-2 py-1 rounded text-xs">{step.element}</code></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  const renderNLPCommandsContent = () => (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Natural Language Commands</h2>
            <p className="text-sm lg:text-base text-gray-600">Convert plain English to automated test code</p>
          </div>
          
          <button
            onClick={() => setIsExamplesPanelOpen(!isExamplesPanelOpen)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-medium shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto"
          >
            <Database className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">Examples</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${isExamplesPanelOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className="mb-6 lg:mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Command</label>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <input
              type="text"
              value={nlpCommand}
              onChange={(e) => setNlpCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNlpCommand()}
              placeholder="e.g., Click the submit button and verify success message"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button 
              onClick={handleNlpCommand}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              <Wand2 className="w-5 h-5" />
            </button>
          </div>
        </div>        {/* Quick Templates */}
        <div className="mb-6 lg:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Templates</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {
              [
                "Click the login button",
                "Fill email field with test@example.com", 
                "Verify success message is displayed",
                "Navigate to dashboard page"
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setNlpCommand(template)}
                  className="text-left p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="font-medium text-gray-800 text-sm lg:text-base">{template}</div>
                  <div className="text-xs lg:text-sm text-gray-500 mt-1">Click to use template</div>
                </button>
              ))}
          </div>
        </div>

        {/* Command History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Command History</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {nlpHistory.map(item => (
              <div key={item.id} className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-gray-200/50">
                <div className="mb-3">
                  <p className="font-medium text-gray-800 text-sm lg:text-base">{item.command}</p>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">{item.timestamp.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 lg:p-4 rounded-lg font-mono text-xs lg:text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{item.generated}</pre>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
                  <button 
                    onClick={() => setNlpCommand(item.command)}
                    className="text-xs lg:text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Reuse Command
                  </button>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  const renderAIChatContent = () => (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 flex-1 flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-64px)]">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">AI Chat Assistant</h2>
              <p className="text-sm lg:text-base text-gray-600">Get intelligent help with test automation</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium text-sm">AI Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="space-y-4 lg:space-y-6">
            {chatMessages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-5 rounded-2xl shadow-sm ${
                  message.sender === 'bot' 
                    ? 'bg-white border border-gray-200 text-gray-800' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                }`}>
                  {message.sender === 'bot' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-600">AI Assistant</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{message.text}</p>
                  <p className="text-xs mt-3 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>        </div>
        
        <div className="p-8 border-t border-gray-200/50 bg-gray-50/50">
          <div className="flex space-x-3">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Ask me anything about testing, automation, or development..."
              className="flex-1 px-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
            />
            <button 
              onClick={handleChatSend}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mt-4">
            {
            [
              "How to write better test cases?",
              "Debug failed automation", 
              "Best practices for testing",
              "Generate test data"
            ].map((prompt, index) => (
              <button
                key={index}
                onClick={() => setChatInput(prompt)}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
          <div className="flex flex-wrap gap-2 mt-4">
            {
            [
              "How to write better test cases?",
              "Debug failed automation", 
              "Best practices for testing",
              "Generate test data"
            ].map((prompt, index) => (
              <button
                key={index}
                onClick={() => setChatInput(prompt)}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

  const renderRightSidebarContent = () => {
    switch (activeTab) {
      case 'parameters':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Test Parameters</h2>
                <p className="text-sm text-gray-600">{parameters.length} parameters configured</p>
              </div>
              <button
                onClick={addParameter}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {parameters.map((param, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200/50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Parameter Name</label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Parameter Value</label>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeParameter(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'testData':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Test Data Sets</h2>
                <p className="text-sm text-gray-600">Manage test data variations</p>
              </div>
              <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Add Set</span>
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 text-center border border-gray-200/50">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">No Test Data Sets</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create a new data set to get started with data-driven testing. You can import CSV files or create custom data sets.
              </p>
            </div>
          </div>
        );
      
      case 'variables':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Environment Variables</h2>
                <p className="text-sm text-gray-600">Global and environment-specific variables</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 text-center border border-gray-200/50">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">No Variables Configured</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Add environment variables for dynamic data handling across test scenarios. Perfect for API endpoints, credentials, and configuration values.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Windows Taskbar-style Sidebar */}
      <div className="w-20 lg:w-20 md:w-16 sm:w-14 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl flex flex-col border-r border-gray-700 fixed h-full z-30">{/* Logo */}
        <div className="p-3 lg:p-4 border-b border-gray-700">
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg lg:rounded-xl flex items-center justify-center">
            <Command className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
          </div>
        </div>

        {/* Fixed Taskbar Tabs */}
        <div className="flex-1 py-2 lg:py-4">
          {taskbarTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTaskbarTab === tab.id;
            
            return (
              <div
                key={tab.id}
                className="relative mb-1 lg:mb-2 px-1 lg:px-2"
              >
                <button
                  onClick={() => switchTaskbarTab(tab.id)}
                  className={`group relative w-full h-10 lg:h-12 rounded-lg lg:rounded-xl transition-all duration-200 flex items-center justify-center ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={tab.title}
                >
                  <IconComponent className="w-4 h-4 lg:w-5 lg:h-5" />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -left-1 top-1 bottom-1 lg:top-2 lg:bottom-2 w-1 bg-white rounded-r-full"></div>
                  )}
                </button>

                {/* Tooltip - Only show on larger screens */}
                <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 hidden lg:block">
                  {tab.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-20">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {(() => {
                  const currentTab = taskbarTabs.find(tab => tab.id === activeTaskbarTab);
                  const IconComponent = currentTab?.icon || Play;
                  return (
                    <>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      <div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">{currentTab?.title || 'Scout Desktop'}</h1>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Professional Test Automation Suite</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-auto">
          {renderTabContent()}
        </div>
      </div>{/* Right Configuration Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 z-50 transform transition-transform duration-300 ease-in-out ${
        isExamplesPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Configuration Panel</h3>
              <p className="text-blue-100 text-xs sm:text-sm">Manage test settings</p>
            </div>
          </div>
          <button 
            onClick={() => setIsExamplesPanelOpen(false)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Premium Tabs */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-1 sm:p-2">
              <div className="grid grid-cols-3 gap-1">
                { [
                  {
                    id: 'parameters',
                    label: 'Parameters',
                    icon: Settings
                  },
                  {
                    id: 'testData',
                    label: 'Test Data',
                    icon: Database
                  },
                  {
                    id: 'variables',
                    label: 'Variables',
                    icon: Code
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-xs font-medium transition-all duration-200 flex flex-col items-center space-y-1 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderRightSidebarContent()}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isExamplesPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExamplesPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default Recorder;