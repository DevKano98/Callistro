import { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import Card from '../components/Card';
import { API_ENDPOINTS } from '../config/api';

export default function CreateAgent() {
  const [agentName, setAgentName] = useState('');
  const [company, setCompany] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentAgent, user } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.CREATE_AGENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, company, prompt, userId: user?.uid }),
      });
      const data = await res.json();
      if (data.id) {
        setCurrentAgent({ id: data.id, agentName: data.agentName, callFlow: data.callFlow });
        alert('Agent created!');
      } else {
        alert('Failed to create agent: ' + (data.error || 'Unknown error'));
      }
    } catch {
      alert('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const presetPrompts = [
    {
      title: 'Sales Development',
      description: 'Qualify leads and book sales demos',
      prompt: 'Introduce yourself warmly. Ask about their current CRM usage. If they use one, highlight our unique features and offer a demo. If not, explain key benefits and assess interest level. Always be professional and respect their time.'
    },
    {
      title: 'Customer Support',
      description: 'Handle support inquiries and collect feedback',
      prompt: 'Start with a friendly greeting. Ask about their experience with our product. Document any issues or feedback. Offer immediate solutions where possible, or escalate to human support when needed.'
    }
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create AI Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your intelligent calling assistant</p>
      </div>
      
      <div className="grid grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="col-span-2">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agent Details Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Sarah"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 text-sm transition-colors"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">Choose a friendly, professional name for your AI agent</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g., TechCorp Inc"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Call Flow Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Flow Instructions</label>
                <textarea
                  placeholder="Describe the conversation flow, key questions to ask, and how to handle different responses..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 text-sm transition-colors"
                  rows="6"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Be specific about how the agent should introduce itself, key questions to ask, and how to handle different responses
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 text-base shadow-sm hover:shadow transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Agent...
                  </div>
                ) : 'Create Agent'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar with Preset Prompts */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 px-4">Preset Templates</h3>
          {presetPrompts.map((preset, index) => (
            <Card 
              key={index} 
              className="p-4 hover:shadow-lg cursor-pointer transition-all duration-200"
              hover={true}
              onClick={() => {
                setPrompt(preset.prompt);
              }}
            >
              <h4 className="text-sm font-medium text-gray-900">{preset.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
            </Card>
          ))}

          {/* Tips Card */}
          <Card className="p-4" style={{ backgroundColor: 'var(--color-primary-bg)', borderColor: 'rgba(79,70,229,0.1)' }}>
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Tips for Success</h4>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Keep instructions clear and specific</li>
              <li>• Include fallback responses</li>
              <li>• Set a professional, friendly tone</li>
              <li>• Focus on value proposition</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}