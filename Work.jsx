import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Trash2, Settings, Code, FileText, Eye, MoreVertical, X, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Command, Clock, Check, AlertCircle, Search, ChevronDown, ChevronUp, Layout, Database, Copy, Download, Zap, Target } from 'lucide-react';

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
        return <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">G</div>;
      case 'action':
        return <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Zap className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-lg"></div>;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
              {/* Premium Logo Section */}
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl">
                      <Command className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Scout</h1>
                    <span className="text-sm text-gray-500 font-medium">Professional Test Automation Suite</span>
                  </div>
                </div>
                
                <button className="sm:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced Scenario Selector */}
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <select 
                    value={activeScenario} 
                    onChange={(e) => setActiveScenario(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white/70 backdrop-blur border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="shop-bling">🛍️ shop-bling</option>
                    <option value="user-login">👤 user-login</option>
                    <option value="checkout-flow">💳 checkout-flow</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setShowCodeModal(true)}
                className="group relative overflow-hidden bg-white/70 backdrop-blur text-gray-700 px-4 py-3 rounded-xl font-medium shadow-sm border border-gray-200 hover:bg-white/80 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <Code className="w-4 h-4" />
                <span>Export Code</span>
              </button>

              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI Support</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button 
                onClick={handleRecordingToggle}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
              >
                {recordingState === 'recording' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{recordingState === 'recording' ? 'Pause Recording' : 'Start Recording'}</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Enhanced Steps Panel */}
          <div className="lg:col-span-8 space-y-8">
            {/* Premium Recording Controls Card */}
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Recording Studio</h2>
                    <p className="text-gray-600">Control your test automation recording session</p>
                  </div>
                  {recordingState === 'recording' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-700 font-medium text-sm">LIVE RECORDING</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleRecordingToggle}
                    className={`group relative overflow-hidden px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center space-x-2 ${
                      recordingState === 'recording' 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                    }`}
                  >
                    {recordingState === 'recording' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span className="font-semibold">
                      {recordingState === 'recording' ? 'Pause' : recordingState === 'paused' ? 'Resume' : 'Run Scenario'}
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  
                  <button
                    onClick={handleStop}
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Square className="w-5 h-5" />
                    <span className="font-semibold">Stop</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>

                  <div className="flex items-center space-x-4 ml-auto text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Target: {activeScenario}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration: 00:00:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Steps List Card */}
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/50"></div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Execution Flow</h2>
                    <p className="text-gray-600">{steps.length} automated steps recorded</p>
                  </div>
                  <button
                    onClick={addStep}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Step</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className="group relative overflow-hidden bg-white/80 backdrop-blur rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-start p-6">
                        <div className="flex-shrink-0 mr-6">
                          {getStepIcon(step.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                {step.type === 'given' ? 'GIVEN' : `STEP ${index + 1}`}
                              </span>
                              {getStatusBadge(step.status)}
                            </div>
                            <button
                              onClick={() => removeStep(step.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-2 leading-relaxed">{step.description}</p>
                          
                          {step.element && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Target className="w-4 h-4" />
                              <span>Target: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{step.element}</code></span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Right Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => setIsExamplesPanelOpen(!isExamplesPanelOpen)}
                className="group w-full relative overflow-hidden bg-white/70 backdrop-blur border border-gray-200/50 rounded-2xl p-6 flex items-center justify-between hover:bg-white/80 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Layout className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Configuration Panel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {isExamplesPanelOpen ? 'Close' : 'Open'} Sidebar
                  </span>
                  <div className={`transform transition-transform duration-200 ${isExamplesPanelOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 z-50 transform transition-transform duration-300 ease-in-out ${
        isExamplesPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Configuration Panel</h3>
              <p className="text-blue-100 text-sm">Manage test settings</p>
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
          <div className="p-6 border-b border-gray-200/50">
            <div className="bg-gray-50 rounded-2xl p-2">
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
                    className={`p-3 rounded-xl text-xs font-medium transition-all duration-200 flex flex-col items-center space-y-1 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'parameters' && (
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
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
            )}

            {activeTab === 'testData' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Test Data Sets</h2>
                    <p className="text-sm text-gray-600">Manage test data variations</p>
                  </div>
                  <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Add Set</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
            )}

            {activeTab === 'variables' && (
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
            )}
          </div>
        </div>
      </div>

      {/* Premium Chat Panel */}
      {isChatOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:right-8 sm:top-32 w-full sm:w-96 bg-white/90 backdrop-blur-xl shadow-2xl border border-white/20 overflow-hidden z-50 sm:rounded-3xl">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-purple-100 text-sm">Always here to help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="p-6 h-96 overflow-y-auto">
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    message.sender === 'bot' 
                      ? 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-800' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200/50 bg-white/50 backdrop-blur">
            <div className="flex space-x-3">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Code Export Studio</h2>
                  <p className="text-gray-300 text-sm">Generate production-ready test code</p>
                </div>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setCodeType('playwright')}
                  className={`px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-200 ${
                    codeType === 'playwright' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>Playwright</span>
                </button>
                <button
                  onClick={() => setCodeType('gherkin')}
                  className={`px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-200 ${
                    codeType === 'gherkin' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Gherkin</span>
                </button>
              </div>

              <div className="bg-gray-900 text-green-400 p-6 rounded-2xl overflow-auto max-h-96 font-mono text-sm leading-relaxed shadow-inner">
                <pre className="whitespace-pre-wrap">
                  {codeType === 'playwright' ? generatePlaywrightCode() : generateGherkinCode()}
                </pre>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-6 py-3 text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeType === 'playwright' ? generatePlaywrightCode() : generateGherkinCode());
                    alert('Code copied to clipboard!');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Save & Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isExamplesPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsExamplesPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default Recorder;