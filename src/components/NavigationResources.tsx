import React from 'react';
import { Link } from 'react-router-dom';

type NavSection = 'main' | 'portal' | 'external' | null;

interface NavigationResourcesProps {
  activeNavSection: NavSection;
  toggleNavSection: (section: 'main' | 'portal' | 'external') => void;
}

export const NavigationResources: React.FC<NavigationResourcesProps> = ({ 
  activeNavSection, 
  toggleNavSection 
}) => {

  const navItems = [
    { id: 'main', title: 'Main Navigation' },
    { id: 'portal', title: 'Customer Portal' },
    { id: 'external', title: 'External Systems' },
  ] as const;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-[var(--phz-purple)] mb-8 text-center">Navigation Resources</h2>
        <div className="max-w-7xl mx-auto relative">
          {/* Redesigned Navigation Layout - Side by Side with Content */}
          <div className="flex flex-col lg:flex-row justify-center gap-6 mb-12">
            {/* Navigation Buttons - Vertical Stack on Left */}
            <div className="flex flex-row lg:flex-col justify-center gap-4 lg:w-1/4">
              {navItems.map((item) => (
                <div 
                  key={item.id}
                  className={`relative z-10 ${
                    activeNavSection === item.id 
                      ? 'bg-[var(--phz-purple)] text-white translate-x-4 lg:translate-x-6 translate-y-0' 
                      : 'bg-[#e5f0f9]'
                  } rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 w-full text-center cursor-pointer transform hover:translate-x-2 lg:hover:translate-x-4 border-2 ${
                    activeNavSection === item.id 
                      ? 'border-[var(--phz-orange)]' 
                      : 'border-transparent'
                  }`}
                  onClick={() => toggleNavSection(item.id)}
                >
                  <h3 className={`text-xl font-bold ${activeNavSection === item.id ? 'text-white' : 'text-[var(--phz-purple)]'}`}>{item.title}</h3>
                </div>
              ))}
            </div>

            {/* Content Area - Right Side Panel */}
            <div className="lg:w-3/4 relative">
              {/* Decorative Connector Line - Vertical for desktop */}
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-[var(--phz-purple)]">
                <div className={`absolute top-0 left-0 w-full h-full ${activeNavSection ? 'animate-pulse' : ''} bg-[rgba(48,167,216,0.35)] opacity-30`}></div>
              </div>
              
              {/* Content Panels */}
              <div className="pl-0 lg:pl-10 relative">
                {/* Dynamic Card Container - All cards visible but only active one prominent */}
                <div className="relative min-h-[350px]">
                  {/* Default Content - Shown when no section is selected */}
                  <div 
                    className={`absolute inset-0 transition-all duration-500 ${
                      activeNavSection === null 
                        ? 'opacity-100 z-30 transform-none' 
                        : 'opacity-0 z-10 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className={`h-full overflow-y-auto bg-white rounded-xl shadow-lg p-6 transition-all duration-300 border-2 border-dashed border-[var(--phz-purple)] border-opacity-50`}>
                      <div className="h-full flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-[#e5f0f9] rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--phz-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--phz-purple)] mb-3">Navigation Resources</h3>
                        <p className="text-gray-600 mb-4 max-w-md">Select one of the navigation options on the left to view detailed information about that section.</p>
                        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                          {navItems.map(item => (
                            <div 
                              key={item.id}
                              className="bg-[#e5f0f9] p-3 rounded-lg text-center cursor-pointer hover:bg-[var(--phz-purple)] hover:text-white transition-all duration-300"
                              onClick={() => toggleNavSection(item.id)}
                            >
                              <p className="text-sm font-medium">{item.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Navigation Content */}
                  <div 
                    className={`absolute inset-0 transition-all duration-500 ${
                      activeNavSection === 'main' 
                        ? 'opacity-100 z-30 transform-none' 
                        : activeNavSection === null 
                          ? 'opacity-0 z-10 scale-95 pointer-events-none' 
                          : 'opacity-30 z-10 scale-90 translate-y-4'
                    }`}
                  >
                    <div className={`h-full overflow-y-auto bg-white ${activeNavSection === 'main' ? 'bg-[#b8d8f2]' : ''} rounded-xl shadow-lg p-6 transition-all duration-300 border-2 ${activeNavSection === 'main' ? 'border-[#00416e]' : 'border-transparent'}`}>
                      <nav className="space-y-3">
                        {['Home', 'Daycare', 'Boarding', 'Grooming', 'Training', 'Supply', 'Contact', 'About Us'].map((item) => (
                          <Link 
                            key={item} 
                            to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                            className="flex items-center p-2 rounded-lg hover:bg-[#e5f0f9] transition-colors"
                          >
                            <span className="w-2 h-2 bg-[var(--phz-purple)] rounded-full mr-3 flex-shrink-0"></span>
                            <span className="font-medium text-[var(--phz-purple)] truncate">{item}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </div>

                  {/* Customer Portal Content */}
                  <div 
                    className={`absolute inset-0 transition-all duration-500 ${
                      activeNavSection === 'portal' 
                        ? 'opacity-100 z-30 transform-none' 
                        : activeNavSection === null 
                          ? 'opacity-0 z-10 scale-95 pointer-events-none' 
                          : 'opacity-30 z-10 scale-90 translate-y-4'
                    }`}
                  >
                    <div className={`h-full overflow-y-auto bg-white ${activeNavSection === 'portal' ? 'bg-[#b8d8f2]' : ''} rounded-xl shadow-lg p-6 transition-all duration-300 border-2 ${activeNavSection === 'portal' ? 'border-[#00416e]' : 'border-transparent'}`}>
                      <div className="h-full flex flex-col">
                        <div className="mb-4 flex-1">
                          <h4 className="font-bold text-[var(--phz-purple)] mb-3 border-b pb-2">Access Points</h4>
                          <ul className="space-y-2">
                            {['Login Page', 'Register Page', 'Portal Page'].map((item) => (
                              <li key={item} className="flex items-center p-2 rounded-lg hover:bg-[#e5f0f9] transition-colors">
                                <span className="w-2 h-2 bg-[var(--phz-purple)] rounded-full mr-3 flex-shrink-0"></span>
                                <span className="font-medium text-[var(--phz-purple)] text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--phz-purple)] mb-3 border-b pb-2">Features</h4>
                          <ul className="space-y-2">
                            {['Welcome Banner', 'Pet Cards - Actions', 'Vaccination Information'].map((item) => (
                              <li key={item} className="flex items-center p-2 rounded-lg hover:bg-[#e5f0f9] transition-colors">
                                <span className="w-2 h-2 bg-[var(--phz-purple)] rounded-full mr-3 flex-shrink-0"></span>
                                <span className="font-medium text-[var(--phz-purple)] text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* External Systems Content */}
                  <div 
                    className={`absolute inset-0 transition-all duration-500 ${
                      activeNavSection === 'external' 
                        ? 'opacity-100 z-30 transform-none' 
                        : activeNavSection === null 
                          ? 'opacity-0 z-10 scale-95 pointer-events-none' 
                          : 'opacity-30 z-10 scale-90 translate-y-4'
                    }`}
                  >
                    <div className={`h-full overflow-y-auto bg-white ${activeNavSection === 'external' ? 'bg-[#b8d8f2]' : ''} rounded-xl shadow-lg p-6 transition-all duration-300 border-2 ${activeNavSection === 'external' ? 'border-[#00416e]' : 'border-transparent'}`}>
                      <div className="h-full flex flex-col justify-center">
                        <h4 className="font-bold text-[var(--phz-purple)] mb-3 border-b pb-2">Integrations</h4>
                        <ul className="space-y-2">
                          {['External Shopify Store', 'Form Submission System'].map((item) => (
                            <li key={item} className="flex items-center p-2 rounded-lg hover:bg-[#e5f0f9] transition-colors">
                              <span className="w-2 h-2 bg-[var(--phz-purple)] rounded-full mr-3 flex-shrink-0"></span>
                              <span className="font-medium text-[var(--phz-purple)] text-sm whitespace-normal break-words">{item}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <h4 className="font-bold text-[var(--phz-purple)] mb-3 mt-5 border-b pb-2">Additional Resources</h4>
                        <ul className="space-y-2">
                          {['Welcome Banner', 'Pet Cards - Actions'].map((item) => (
                            <li key={item} className="flex items-center p-2 rounded-lg hover:bg-[#e5f0f9] transition-colors">
                              <span className="w-2 h-2 bg-[var(--phz-purple)] rounded-full mr-3 flex-shrink-0"></span>
                              <span className="font-medium text-[var(--phz-purple)] text-sm whitespace-normal break-words">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Connector Line at Bottom */}
          <div className="w-full flex justify-center mb-4">
            <div className="h-10 w-1 bg-[var(--phz-purple)] relative">
              <div className={`absolute top-0 left-0 w-full ${activeNavSection ? 'animate-pulse' : ''} bg-[rgba(48,167,216,0.35)] h-full opacity-30`}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 
