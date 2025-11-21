import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'supporting_video' | 'assignment' | 'pdf';
  completed: boolean;
  duration?: string;
  videoUrl?: string;
  pdfUrl?: string;
  description?: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  weekNumber: number;
  lessons: Lesson[];
  isLocked: boolean;
  unlockDate: string;
}

const Modules = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Student';
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const getTypePriority = (type: string) => {
    switch (type) {
      case 'video': return 1;
      case 'supporting_video': return 2;
      case 'pdf': return 3;
      case 'assignment': return 4;
      default: return 5;
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
                    *,
                    lectures (*)
                `)
        .eq('is_published', true)
        .order('week_number', { ascending: true });

      if (error) throw error;

      if (data) {
        const now = new Date();

        const transformedModules: Module[] = data.map((m: any) => {
          const unlockDate = new Date(m.unlock_date);
          const isLocked = unlockDate > now;

          // Sort lectures by Type Priority then order_index
          const sortedLectures = m.lectures?.sort((a: any, b: any) => {
            const typeA = a.content_type || (a.video_url ? 'video' : 'assignment');
            const typeB = b.content_type || (b.video_url ? 'video' : 'assignment');

            const priorityA = getTypePriority(typeA);
            const priorityB = getTypePriority(typeB);

            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.order_index - b.order_index;
          }) || [];

          return {
            id: m.id,
            title: m.title,
            weekNumber: m.week_number,
            isLocked: isLocked,
            unlockDate: unlockDate.toLocaleDateString(),
            lessons: sortedLectures.map((l: any) => ({
              id: l.id,
              title: l.title,
              type: l.content_type || (l.video_url ? 'video' : 'assignment'), // Fallback for old data
              completed: false, // TODO: Fetch progress
              duration: l.duration_minutes ? `${l.duration_minutes} min` : '10 min',
              videoUrl: l.video_url,
              pdfUrl: l.pdf_url,
              description: l.description,
              order_index: l.order_index
            })),
          };
        });

        setModules(transformedModules);

        // Set initial state to first unlocked module
        const firstUnlocked = transformedModules.find(m => !m.isLocked);
        if (firstUnlocked) {
          setExpandedModules([firstUnlocked.id]);
          setCurrentModule(firstUnlocked);
          if (firstUnlocked.lessons.length > 0) {
            setCurrentLesson(firstUnlocked.lessons[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.isLocked) return;

    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonClick = (module: Module, lesson: Lesson) => {
    if (module.isLocked) return;
    setCurrentLesson(lesson);
    setCurrentModule(module);
  };

  const handleNextLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      // Next lesson in same module
      setCurrentLesson(currentModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < modules.length - 1) {
      // First lesson of next module
      const nextModule = modules[currentModuleIndex + 1];
      if (!nextModule.isLocked) {
        setCurrentModule(nextModule);
        setCurrentLesson(nextModule.lessons[0]);
        setExpandedModules(prev => [...prev, nextModule.id]);
      }
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'supporting_video': return '📹';
      case 'assignment': return '📝';
      case 'pdf': return '📄';
      default: return '📚';
    }
  };

  const renderContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case 'video':
      case 'supporting_video':
        return (
          <div className="video-container">
            <div className="video-player">
              {currentLesson.videoUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-placeholder">
                  <p>Video URL not available</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'assignment':
        return (
          <div className="content-card assignment-card">
            <div className="card-header">
              <span className="icon">📝</span>
              <h3>Assignment Instructions</h3>
            </div>
            <div className="card-body">
              <div className="text-content">{currentLesson.description}</div>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary">Submit Assignment</button>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="content-card pdf-card">
            <div className="card-header">
              <span className="icon">📄</span>
              <h3>Study Resource</h3>
            </div>
            <div className="card-body">
              <p>{currentLesson.description}</p>
              {currentLesson.pdfUrl && (
                <a href={currentLesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Open Resource ↗
                </a>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="content-card">
            <div className="text-content">{currentLesson.description}</div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="modules-learning-view" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '1.5rem' }}>Loading course content...</div>
      </div>
    );
  }

  return (
    <div className="modules-learning-view">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-content">
          <h2 className="page-title">Lesson</h2>
          <div className="top-bar-actions">
            <div className="user-profile-menu">
              <div className="user-avatar">{userName.charAt(0)}</div>
              <span className="user-name">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="content-wrapper">
        {/* Left Sidebar - Module List */}
        <aside className="modules-sidebar">
          <div className="sidebar-header">
            <h3>Course Content</h3>
          </div>

          <div className="modules-list">
            {modules.map((module) => (
              <div key={module.id} className={`module-item ${module.isLocked ? 'locked' : ''}`}>
                <button
                  className="module-header"
                  onClick={() => toggleModule(module.id)}
                  disabled={module.isLocked}
                >
                  <span className={`expand-icon ${expandedModules.includes(module.id) ? 'expanded' : ''}`}>
                    {module.isLocked ? '🔒' : '▶'}
                  </span>
                  <div className="module-info">
                    <h4>{module.title}</h4>
                    <p className="module-meta">
                      Week {module.weekNumber} • {module.isLocked ? `Unlocks ${module.unlockDate}` : `${module.lessons.length} items`}
                    </p>
                  </div>
                </button>

                {!module.isLocked && expandedModules.includes(module.id) && (
                  <div className="module-content">
                    {/* Group items if needed, for now just list them */}
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        className={`lesson-item type-${lesson.type} ${currentLesson?.id === lesson.id ? 'active' : ''}`}
                        onClick={() => handleLessonClick(module, lesson)}
                      >
                        <span className="lesson-icon">{getLessonIcon(lesson.type)}</span>
                        <div className="lesson-details">
                          <span className="lesson-title">{lesson.title}</span>
                        </div>
                        {lesson.completed && <span className="completion-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area - Lesson Viewer */}
        <main className="lesson-viewer">
          {currentLesson ? (
            <div className="lesson-container">
              <div className="lesson-header">
                <span className="lesson-type-badge">{currentLesson.type.replace('_', ' ').toUpperCase()}</span>
                <h1 className="lesson-title">{currentLesson.title}</h1>
              </div>

              {/* Content Display */}
              {renderContent()}

              {/* Lesson Actions */}
              <div className="lesson-actions">
                <button className="btn btn-primary btn-lg" onClick={handleNextLesson}>
                  Next Item →
                </button>
              </div>

              {/* Lesson Description (only for videos as others have it in card) */}
              {(currentLesson.type === 'video' || currentLesson.type === 'supporting_video') && (
                <div className="lesson-description">
                  <h3>About this lesson</h3>
                  <p>{currentLesson.description || "No description available."}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="lesson-container" style={{ textAlign: 'center', marginTop: '100px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
              <h2>Select an item to start learning</h2>
              <p>Choose a module from the sidebar to view its content.</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .modules-learning-view {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--color-gray-50);
        }

        /* Top Bar */
        .top-bar {
          background: var(--color-white);
          border-bottom: 2px solid var(--color-gray-200);
          padding: var(--spacing-lg) var(--spacing-2xl);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .top-bar-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: 1.5rem;
          margin: 0;
          color: var(--color-gray-900);
        }

        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-gray-100);
          border-radius: var(--radius-full);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gradient-primary);
          color: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        /* Content Wrapper */
        .content-wrapper {
          display: flex;
          flex: 1;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        /* Modules Sidebar */
        .modules-sidebar {
          width: 380px;
          background: var(--color-white);
          border-right: 2px solid var(--color-gray-200);
          overflow-y: auto;
          max-height: calc(100vh - 80px);
        }

        .sidebar-header {
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-gray-200);
          background: var(--color-gray-50);
        }

        .modules-list {
          padding: var(--spacing-md);
        }

        /* Module Item */
        .module-item {
          margin-bottom: var(--spacing-md);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-white);
        }

        .module-item.locked {
          opacity: 0.7;
          background: var(--color-gray-50);
        }

        .module-header {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--color-gray-50);
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
          text-align: left;
        }

        .module-header:hover:not(:disabled) {
          background: var(--color-gray-100);
        }

        .expand-icon {
          font-size: 0.75rem;
          color: var(--color-gray-600);
          transition: transform var(--transition-fast);
          margin-top: 4px;
        }

        .expand-icon.expanded {
          transform: rotate(90deg);
        }

        .module-info h4 {
          font-size: 1rem;
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--color-gray-900);
        }

        .module-meta {
          font-size: 0.75rem;
          color: var(--color-gray-600);
          margin: 0;
        }

        /* Module Content */
        .module-content {
          padding: var(--spacing-sm);
        }

        /* Lesson Item */
        .lesson-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          margin-bottom: var(--spacing-xs);
        }

        .lesson-item:hover {
          background: var(--color-gray-50);
        }

        .lesson-item.active {
          background: var(--gradient-primary);
          color: var(--color-white);
        }

        .lesson-item.active .lesson-title,
        .lesson-item.active .lesson-duration {
          color: var(--color-white);
        }
        
        .lesson-item.type-supporting_video .lesson-title { font-style: italic; color: var(--color-gray-600); }
        .lesson-item.active.type-supporting_video .lesson-title { color: var(--color-white); }
        
        .lesson-item.type-assignment .lesson-title { font-weight: 600; }

        .lesson-icon {
          font-size: 1.25rem;
        }

        .lesson-details {
          flex: 1;
        }

        .lesson-title {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-900);
          margin-bottom: 2px;
        }

        .lesson-duration {
          display: block;
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        /* Lesson Viewer */
        .lesson-viewer {
          flex: 1;
          padding: var(--spacing-2xl);
          overflow-y: auto;
          height: calc(100vh - 80px);
        }

        .lesson-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .lesson-header {
            margin-bottom: var(--spacing-lg);
        }
        
        .lesson-type-badge {
            display: inline-block;
            padding: 4px 8px;
            background: var(--color-gray-200);
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--color-gray-700);
            margin-bottom: var(--spacing-sm);
        }

        .lesson-title {
          font-size: 2rem;
          margin: 0;
          color: var(--color-gray-900);
        }

        .video-container {
          margin-bottom: var(--spacing-xl);
        }

        .video-player {
          aspect-ratio: 16/9;
          background: var(--color-black);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: var(--spacing-md);
          box-shadow: var(--shadow-lg);
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
        }

        .content-card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          border: 1px solid var(--color-gray-200);
        }
        
        .card-header {
            padding: var(--spacing-lg);
            background: var(--color-gray-50);
            border-bottom: 1px solid var(--color-gray-200);
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
        }
        
        .card-header h3 { margin: 0; font-size: 1.125rem; }
        .card-header .icon { font-size: 1.5rem; }
        
        .card-body {
            padding: var(--spacing-xl);
        }
        
        .card-footer {
            padding: var(--spacing-lg);
            border-top: 1px solid var(--color-gray-200);
            background: var(--color-gray-50);
            text-align: right;
        }

        .text-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--color-gray-800);
          white-space: pre-wrap;
        }

        .lesson-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-2xl);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .lesson-description h3 {
          font-size: 1.25rem;
          margin-bottom: var(--spacing-md);
        }

        .lesson-description p {
          color: var(--color-gray-600);
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .modules-sidebar {
            width: 300px;
          }
        }

        @media (max-width: 768px) {
          .content-wrapper {
            flex-direction: column;
          }

          .modules-sidebar {
            width: 100%;
            height: auto;
            max-height: 400px;
            border-right: none;
            border-bottom: 2px solid var(--color-gray-200);
          }

          .lesson-viewer {
            height: auto;
            padding: var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  );
};

export default Modules;
