import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Trash2, Settings, Code, FileText, Eye, MoreVertical, X, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Command, Clock, Check, AlertCircle, Search, ChevronDown, ChevronUp, Layout, Database } from 'lucide-react';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recordingState, setRecordingState] = useState('stopped'); 
  const [activeScenario, setActiveScenario] = useState('shop-bling');
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

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeType, setCodeType] = useState('playwright'); // playwright, gherkin

  const [expandedSections, setExpandedSections] = useState({
    examples: false
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Scout Chat! How can I help you today?", sender: "bot" }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [activeTab, setActiveTab] = useState('parameters'); // parameters, testData, variables
  const [isExamplesPanelOpen, setIsExamplesPanelOpen] = useState(true);

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

  const addStep = () => {
    const newStep = {
      id: steps.length + 1,
      type: 'action',
      description: 'New test step',
      element: 'Element',
      status: 'pending'
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId) => {
    setSteps(steps.filter(step => step.id !== stepId));
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

  const generatePlaywrightCode = () => {
    return `const { test, expect } = require('@playwright/test');

test('${activeScenario} test', async ({ page }) => {
  // Test parameters
  const username = '${parameters.find(p => p.name === 'username')?.value || 'user'}';
  const password = '${parameters.find(p => p.name === 'password')?.value || 'let_me_in'}';
  
  // Test steps
  await page.goto('https://example.com');
  await page.fill('[data-testid="username"]', username);
  await page.fill('[data-testid="password"]', password);
  await page.click('button:has-text("Login")');
  
  // Verify login success
  await expect(page).toHaveURL(/dashboard/);
});`;
  };

  const generateGherkinCode = () => {
    return `Feature: ${activeScenario}
  As a user
  I want to login to the application
  So that I can access my account

  Scenario: Successful login
    Given The user logs in with username "<username>" and password "<password>"
    When I fill the username field with "<username>"
    And I fill the password field with "<password>"
    And I click the Login button
    Then I should be redirected to the dashboard

  Examples:
    | username   | password  |
    | bling_user | let_me_in |`;
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'given':
        return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>;
      case 'action':
        return <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">⚡</div>;
      default:
        return <div className="w-6 h-6 bg-gray-300 rounded-full"></div>;
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // When sidebar opens, automatically expand examples section
    if (!isSidebarOpen) {
      setExpandedSections(prev => ({
        ...prev,
        examples: true
      }));
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: currentMessage,
        sender: "user"
      };
      setMessages([...messages, newMessage]);
      setCurrentMessage("");
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "Thanks for your message! I'm here to help.",
          sender: "bot"
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const uiTheme = {
    card: "bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200",
    button: "px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200",
    buttonPrimary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
    buttonSecondary: "bg-gray-50 text-gray-700 hover:bg-gray-100",
    input: "w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    header: "bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200",
    icon: "w-4 h-4 sm:w-5 sm:h-5 text-gray-500",
    title: "text-lg sm:text-xl font-semibold text-gray-800",
    subtitle: "text-xs sm:text-sm text-gray-500",
    badge: "px-2 py-1 rounded-full text-xs font-medium",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      <div className={`${uiTheme.header} sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-4`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
            {/* Logo Section */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg">
                  <Command className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">Scout</h1>
                  <span className="text-xs text-gray-500 hidden sm:inline">Test Automation Suite</span>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button className="sm:hidden p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Scenario Selector - Full width on mobile */}
            <div className="w-full sm:w-auto">
              <select 
                value={activeScenario} 
                onChange={(e) => setActiveScenario(e.target.value)}
                className="w-full sm:w-auto text-sm font-medium text-gray-700 border rounded-lg px-3 py-2 sm:px-4"
              >
                <option value="shop-bling">shop-bling</option>
                <option value="user-login">user-login</option>
                <option value="checkout-flow">checkout-flow</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`${uiTheme.button} ${uiTheme.buttonSecondary} flex items-center space-x-2`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Support</span>
            </button>

            <button className={`${uiTheme.button} ${uiTheme.buttonPrimary} flex items-center space-x-2`}>
              <Play className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Steps Panel - Full width on mobile, 8 cols on large screens */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Recording Controls Card */}
            <div className={uiTheme.card}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={uiTheme.title}>Recording Controls</h2>
                    <p className={uiTheme.subtitle}>Manage your test recording session</p>
                  </div>
                  {recordingState === 'recording' && (
                    <span className={`${uiTheme.badge} bg-red-50 text-red-600`}>
                      <span className="w-2 h-2 bg-red-600 rounded-full inline-block animate-pulse mr-2" />
                      Recording
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRecordingToggle}
                    className={`flex items-center px-4 py-2 rounded ${
                      recordingState === 'recording' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {recordingState === 'recording' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {recordingState === 'recording' ? 'Pause' : recordingState === 'paused' ? 'Resume' : 'Run scenario'}
                  </button>
                  
                  <button
                    onClick={handleStop}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </button>
                </div>
              </div>
            </div>

            {/* Steps List Card */}
            <div className={uiTheme.card}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={uiTheme.title}>Test Steps</h2>
                    <p className={uiTheme.subtitle}>{steps.length} steps recorded</p>
                  </div>
                  <button
                    onClick={addStep}
                    className={`${uiTheme.button} ${uiTheme.buttonPrimary}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Enhanced step cards */}
                  {steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`${uiTheme.card} hover:border-blue-200 cursor-pointer`}
                    >
                      <div className="flex items-start p-4">
                        <div className="flex-shrink-0 mr-4">
                          {getStepIcon(step.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-600">
                              {step.type === 'given' ? 'Given' : `${index + 1} -`}
                            </span>
                            <button
                              onClick={() => removeStep(step.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-900 mt-1">{step.description}</p>
                          
                          {step.element && (
                            <p className="text-xs text-gray-500 mt-1">
                              Element: {step.element}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Full width on mobile, 4 cols on large screens */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 sm:top-24">
              {/* Examples Panel Toggle */}
              <button
                onClick={() => setIsExamplesPanelOpen(!isExamplesPanelOpen)}
                className={`${uiTheme.card} w-full p-4 flex items-center justify-between mb-4`}
              >
                <div className="flex items-center space-x-2">
                  <Layout className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Examples Panel</span>
                </div>
                {isExamplesPanelOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Examples Content */}
              {isExamplesPanelOpen && (
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className={`${uiTheme.card} p-2`}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setActiveTab('parameters')}
                        className={`flex-1 p-2 rounded-lg text-sm font-medium ${
                          activeTab === 'parameters'
                            ? uiTheme.buttonPrimary
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Parameters
                      </button>
                      <button
                        onClick={() => setActiveTab('testData')}
                        className={`flex-1 p-2 rounded-lg text-sm font-medium ${
                          activeTab === 'testData'
                            ? uiTheme.buttonPrimary
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Test Data
                      </button>
                      <button
                        onClick={() => setActiveTab('variables')}
                        className={`flex-1 p-2 rounded-lg text-sm font-medium ${
                          activeTab === 'variables'
                            ? uiTheme.buttonPrimary
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Variables
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className={uiTheme.card}>
                    <div className="p-6">
                      {activeTab === 'parameters' && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className={uiTheme.title}>Test Parameters</h2>
                              <p className={uiTheme.subtitle}>
                                {parameters.length} parameters defined
                              </p>
                            </div>
                            <button
                              onClick={addParameter}
                              className={`${uiTheme.button} ${uiTheme.buttonPrimary}`}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Parameter
                            </button>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="font-medium text-sm text-gray-700">Parameters</div>
                              <div className="font-medium text-sm text-gray-700">Value</div>
                              <div className="font-medium text-sm text-gray-700">Actions</div>
                            </div>
                            
                            {parameters.map((param, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 items-center py-2">
                                <input
                                  type="text"
                                  value={param.name}
                                  onChange={(e) => updateParameter(index, 'name', e.target.value)}
                                  className="px-3 py-2 border rounded text-sm"
                                />
                                <input
                                  type="text"
                                  value={param.value}
                                  onChange={(e) => updateParameter(index, 'value', e.target.value)}
                                  className="px-3 py-2 border rounded text-sm"
                                />
                                <button
                                  onClick={() => removeParameter(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'testData' && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className={uiTheme.title}>Test Data Sets</h2>
                              <p className={uiTheme.subtitle}>
                                Manage test data variations
                              </p>
                            </div>
                            <button
                              className={`${uiTheme.button} ${uiTheme.buttonPrimary}`}
                            >
                              <Database className="w-4 h-4 mr-2" />
                              Add Data Set
                            </button>
                          </div>
                          {/* Test Data Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-500 text-sm">
                              No test data sets found. Create a new data set to get started.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'variables' && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className={uiTheme.title}>Variables</h2>
                              <p className={uiTheme.subtitle}>
                                Environment and global variables
                              </p>
                            </div>
                          </div>
                          {/* Variables Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-500 text-sm">
                              No variables found. Add variables to your scenario for dynamic data handling.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Chat Panel */}
      {isChatOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:right-6 sm:top-20 w-full sm:w-96 bg-white shadow-xl border border-gray-200 overflow-hidden z-50 sm:rounded-xl">
          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="font-semibold text-gray-800">Chat Support</h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-indigo-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 h-[calc(100vh-160px)] overflow-y-auto">
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg ${
                    message.sender === 'bot' 
                      ? 'bg-gray-100' 
                      : 'bg-indigo-600 text-white ml-auto'
                  } max-w-[80%] ${
                    message.sender === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Generated Code</h2>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setCodeType('playwright')}
                  className={`px-4 py-2 rounded flex items-center ${
                    codeType === 'playwright' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Playwright
                </button>
                <button
                  onClick={() => setCodeType('gherkin')}
                  className={`px-4 py-2 rounded flex items-center ${
                    codeType === 'gherkin' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gherkin
                </button>
              </div>

              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {codeType === 'playwright' ? generatePlaywrightCode() : generateGherkinCode()}
                </pre>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeType === 'playwright' ? generatePlaywrightCode() : generateGherkinCode());
                    alert('Code copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copy Code
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save & Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recorder;