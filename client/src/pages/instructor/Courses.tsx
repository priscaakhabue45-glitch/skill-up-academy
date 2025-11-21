import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Lecture {
    id: string;
    title: string;
    description: string;
    video_url?: string;
    pdf_url?: string;
    duration_minutes: number;
    order_index: number;
    content_type: 'video' | 'supporting_video' | 'assignment' | 'pdf';
    created_at: string;
}

interface Module {
    id: string;
    title: string;
    description: string;
    week_number: number;
    is_published: boolean;
    created_at: string;
    lectures?: Lecture[];
}

const Courses = () => {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Selection State
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lecture | null>(null);

    // Modal Visibility State
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [showEditModuleModal, setShowEditModuleModal] = useState(false);

    // Module Form State (Create & Edit)
    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        week_number: 1,
    });

    // Lesson Form State (Create & Edit)
    const [contentType, setContentType] = useState<'video' | 'supporting_video' | 'assignment' | 'pdf'>('video');
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        video_url: '',
        pdf_url: '',
    });

    const [submitting, setSubmitting] = useState(false);

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

    const sortLectures = (lectures: Lecture[]) => {
        return lectures.sort((a, b) => {
            const priorityA = getTypePriority(a.content_type);
            const priorityB = getTypePriority(b.content_type);
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.order_index - b.order_index;
        });
    };

    const fetchModules = async () => {
        try {
            const { data, error } = await supabase
                .from('modules')
                .select(`
                    *,
                    lectures (*)
                `)
                .order('week_number', { ascending: true });

            if (error) throw error;

            const sortedData = data?.map(module => ({
                ...module,
                lectures: sortLectures(module.lectures || [])
            }));

            setModules(sortedData || []);
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Module Management ---

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const unlockDate = new Date();
            unlockDate.setDate(unlockDate.getDate() + (moduleForm.week_number - 1) * 7);

            const { data, error } = await supabase
                .from('modules')
                .insert([
                    {
                        title: moduleForm.title,
                        description: moduleForm.description,
                        week_number: moduleForm.week_number,
                        unlock_date: unlockDate.toISOString(),
                        content_order: moduleForm.week_number,
                        is_published: true
                    }
                ])
                .select();

            if (error) throw error;

            setModules([...modules, ...(data || [])]);
            setShowCreateForm(false);
            setModuleForm({ title: '', description: '', week_number: modules.length + 2 });
            alert('Module created successfully!');
        } catch (error) {
            console.error('Error creating module:', error);
            alert('Failed to create module. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedModule) return;
        setSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('modules')
                .update({
                    title: moduleForm.title,
                    description: moduleForm.description,
                    week_number: moduleForm.week_number,
                })
                .eq('id', selectedModule.id)
                .select();

            if (error) throw error;

            // Update local state
            const updatedModules = modules.map(m =>
                m.id === selectedModule.id ? { ...m, ...data![0], lectures: m.lectures } : m
            );
            setModules(updatedModules);
            setShowEditModuleModal(false);
            alert('Module updated successfully!');
        } catch (error) {
            console.error('Error updating module:', error);
            alert('Failed to update module.');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModuleModal = (module: Module) => {
        setSelectedModule(module);
        setModuleForm({
            title: module.title,
            description: module.description,
            week_number: module.week_number,
        });
        setShowEditModuleModal(true);
    };

    // --- Lesson Management ---

    const handleSaveContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedModule) return;

        setSubmitting(true);

        try {
            if (selectedLesson) {
                // UPDATE existing lesson
                const { data, error } = await supabase
                    .from('lectures')
                    .update({
                        title: lessonForm.title,
                        description: lessonForm.description,
                        video_url: (contentType === 'video' || contentType === 'supporting_video') ? lessonForm.video_url : null,
                        pdf_url: contentType === 'pdf' ? lessonForm.pdf_url : null,
                        content_type: contentType
                    })
                    .eq('id', selectedLesson.id)
                    .select();

                if (error) throw error;

                // Update local state
                const updatedModules = modules.map(m => {
                    if (m.id === selectedModule.id) {
                        const updatedLectures = m.lectures?.map(l => l.id === selectedLesson.id ? data![0] : l) || [];
                        const updatedModule = { ...m, lectures: sortLectures(updatedLectures) };
                        setSelectedModule(updatedModule); // Update modal view
                        return updatedModule;
                    }
                    return m;
                });
                setModules(updatedModules);
                alert('Content updated successfully!');
            } else {
                // CREATE new lesson
                const currentLength = selectedModule.lectures?.length || 0;
                const nextOrderIndex = currentLength + 1;

                const { data, error } = await supabase
                    .from('lectures')
                    .insert([
                        {
                            module_id: selectedModule.id,
                            title: lessonForm.title,
                            description: lessonForm.description,
                            video_url: (contentType === 'video' || contentType === 'supporting_video') ? lessonForm.video_url : null,
                            pdf_url: contentType === 'pdf' ? lessonForm.pdf_url : null,
                            duration_minutes: 0,
                            order_index: nextOrderIndex,
                            content_type: contentType
                        }
                    ])
                    .select();

                if (error) throw error;

                // Update local state
                const updatedModules = modules.map(m => {
                    if (m.id === selectedModule.id) {
                        const newLectures = [...(m.lectures || []), ...(data || [])];
                        const updatedModule = { ...m, lectures: sortLectures(newLectures) };
                        setSelectedModule(updatedModule); // Update modal view
                        return updatedModule;
                    }
                    return m;
                });
                setModules(updatedModules);
                alert('Content added successfully!');
            }

            setShowLessonForm(false);
            resetLessonForm();
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Failed to save content. Please try again.');
            console.error('Error deleting lesson:', error);
            alert('Failed to delete content.');
        }
    };

    const handleDeleteLesson = async (lessonId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            const { error } = await supabase
                .from('lectures')
                .delete()
                .eq('id', lessonId);

            if (error) throw error;

            // 1. Update modules list using functional update to ensure latest state
            setModules(prevModules => prevModules.map(m => {
                if (m.lectures?.some(l => l.id === lessonId)) {
                    return {
                        ...m,
                        lectures: m.lectures.filter(l => l.id !== lessonId)
                    };
                }
                return m;
            }));

            // 2. Update selectedModule directly if it's the one currently open
            if (selectedModule && selectedModule.lectures?.some(l => l.id === lessonId)) {
                setSelectedModule(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        lectures: prev.lectures?.filter(l => l.id !== lessonId)
                    };
                });
            }

            // If we were editing this lesson, close the modal
            if (selectedLesson?.id === lessonId) {
                setShowLessonForm(false);
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Failed to delete content.');
        }
    };

    const openAddContentModal = (module: Module) => {
        setSelectedModule(module);
        setSelectedLesson(null); // Clear selection for "Add" mode
        setContentType('video');
        resetLessonForm();
        setShowLessonForm(true);
    };

    const openEditContentModal = (lesson: Lecture, module: Module) => {
        setSelectedModule(module);
        setSelectedLesson(lesson);
        setContentType(lesson.content_type);
        setLessonForm({
            title: lesson.title,
            description: lesson.description || '',
            video_url: lesson.video_url || '',
            pdf_url: lesson.pdf_url || '',
        });
        setShowLessonForm(true);
    };

    const resetLessonForm = () => {
        setLessonForm({
            title: '',
            description: '',
            video_url: '',
            pdf_url: '',
        });
    };

    const seedDatabase = async () => {
        if (!confirm('WARNING: This will DELETE ALL existing modules and reset to default content. Are you sure?')) return;
        setSubmitting(true);
        try {
            // 0. Delete all existing modules (Cascade will delete lectures)
            const { error: deleteError } = await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            if (deleteError) throw deleteError;

            // 1. Create Module 1
            const { data: module1, error: m1Error } = await supabase
                .from('modules')
                .insert({
                    title: 'Mindset Reengineering',
                    description: 'Personal Vision Statement',
                    week_number: 1,
                    unlock_date: new Date().toISOString(),
                    content_order: 1,
                    is_published: true
                })
                .select()
                .single();

            if (m1Error) throw m1Error;

            // 2. Add Lessons to Module 1
            const lessons = [
                {
                    module_id: module1.id,
                    title: 'Introduction to Growth Mindset',
                    description: 'Understanding the basics of growth mindset.',
                    video_url: 'https://www.youtube.com/embed/M523S3kap9s',
                    duration_minutes: 15,
                    order_index: 1,
                    content_type: 'video'
                },
                {
                    module_id: module1.id,
                    title: 'Overcoming Limiting Beliefs',
                    description: 'How to identify and crush limiting beliefs.',
                    video_url: 'https://www.youtube.com/embed/M523S3kap9s',
                    duration_minutes: 20,
                    order_index: 2,
                    content_type: 'video'
                },
                {
                    module_id: module1.id,
                    title: 'TED Talk: The Power of Belief',
                    description: 'Supplementary viewing on mindset.',
                    video_url: 'https://www.youtube.com/embed/M523S3kap9s',
                    duration_minutes: 10,
                    order_index: 3,
                    content_type: 'supporting_video'
                },
                {
                    module_id: module1.id,
                    title: 'Assignment: Personal Vision Statement',
                    description: 'Draft your personal vision statement using the template provided. Focus on your 5-year goals.',
                    duration_minutes: 45,
                    order_index: 4,
                    content_type: 'assignment'
                }
            ];

            const { error: lError } = await supabase.from('lectures').insert(lessons);
            if (lError) throw lError;

            // 3. Create Placeholders for Modules 2-14
            const placeholders = [];
            for (let i = 2; i <= 14; i++) {
                const unlockDate = new Date();
                unlockDate.setDate(unlockDate.getDate() + (i - 1) * 7);
                placeholders.push({
                    title: `Week ${i}: Upcoming Module`,
                    description: 'Content coming soon...',
                    week_number: i,
                    unlock_date: unlockDate.toISOString(),
                    content_order: i,
                    is_published: true
                });
            }

            const { error: pError } = await supabase.from('modules').insert(placeholders);
            if (pError) throw pError;

            alert('Database reset and seeded successfully!');
            fetchModules();
        } catch (error) {
            console.error('Error seeding database:', error);
            alert(`Failed to seed database: ${(error as any).message || error}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="courses-view animate-fadeIn">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Course Management</h1>
                    <p className="view-subtitle">Manage your curriculum and modules</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={seedDatabase}
                        disabled={submitting}
                    >
                        {submitting ? 'Seeding...' : '⚡ Reset & Seed Default'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? 'Cancel' : '+ Create New Module'}
                    </button>
                </div>
            </div>

            {/* Create Module Form */}
            {showCreateForm && (
                <div className="card form-card">
                    <h3>Create New Module</h3>
                    <form onSubmit={handleCreateModule}>
                        <div className="form-group">
                            <label>Module Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                required
                                placeholder="e.g., Mindset Reengineering"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="form-textarea"
                                value={moduleForm.description}
                                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                placeholder="Brief description of what students will learn..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Week Number</label>
                            <input
                                type="number"
                                className="form-input"
                                value={moduleForm.week_number}
                                onChange={(e) => setModuleForm({ ...moduleForm, week_number: parseInt(e.target.value) })}
                                min="1"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Module'}
                        </button>
                    </form>
                </div>
            )}

            {/* Edit Module Modal */}
            {showEditModuleModal && selectedModule && (
                <div className="modal-overlay" onClick={() => setShowEditModuleModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Module: {selectedModule.title}</h3>
                            <button className="close-btn" onClick={() => setShowEditModuleModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {/* Module Details Form */}
                            <form onSubmit={handleUpdateModule} style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <h4>Module Details</h4>
                                <div className="form-group">
                                    <label>Module Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={moduleForm.title}
                                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={moduleForm.description}
                                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Week Number</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={moduleForm.week_number}
                                        onChange={(e) => setModuleForm({ ...moduleForm, week_number: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        Save Module Details
                                    </button>
                                </div>
                            </form>

                            {/* Manage Content List */}
                            <div className="manage-content-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0 }}>Manage Content</h4>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => {
                                            setShowEditModuleModal(false); // Close edit modal
                                            openAddContentModal(selectedModule); // Open add content modal
                                        }}
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {selectedModule.lectures && selectedModule.lectures.length > 0 ? (
                                    <ul className="manage-list">
                                        {selectedModule.lectures.map(lesson => (
                                            <li key={lesson.id} className="manage-item">
                                                <div className="item-info">
                                                    <span className="item-icon">
                                                        {lesson.content_type === 'video' && '🎥'}
                                                        {lesson.content_type === 'supporting_video' && '📹'}
                                                        {lesson.content_type === 'assignment' && '📝'}
                                                        {lesson.content_type === 'pdf' && '📄'}
                                                    </span>
                                                    <span className="item-title">{lesson.title}</span>
                                                </div>
                                                <div className="item-actions">
                                                    <button
                                                        className="btn-icon edit"
                                                        onClick={() => {
                                                            setShowEditModuleModal(false);
                                                            openEditContentModal(lesson, selectedModule);
                                                        }}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-icon delete"
                                                        onClick={(e) => handleDeleteLesson(lesson.id, e)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted">No content in this module yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Content Modal */}
            {showLessonForm && selectedModule && (
                <div className="modal-overlay" onClick={() => setShowLessonForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedLesson ? 'Edit Content' : 'Add Content'} to: {selectedModule.title}</h3>
                            <button className="close-btn" onClick={() => setShowLessonForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveContent} className="modal-body">
                            {/* Content Type Selector */}
                            <div className="form-group">
                                <label>Content Type</label>
                                <select
                                    className="form-input"
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value as any)}
                                >
                                    <option value="video">🎥 Core Lesson Video</option>
                                    <option value="supporting_video">📹 Supporting Resource Video</option>
                                    <option value="pdf">📄 PDF / Document</option>
                                    <option value="assignment">📝 Assignment / Task</option>
                                </select>
                                <p className="form-hint">
                                    Content will be automatically ordered: Videos → Supporting → PDFs → Assignments
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    required
                                    placeholder="e.g., Introduction to Growth Mindset"
                                />
                            </div>

                            {(contentType === 'video' || contentType === 'supporting_video') && (
                                <div className="form-group">
                                    <label>YouTube Embed URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={lessonForm.video_url}
                                        onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                                        placeholder="https://www.youtube.com/embed/..."
                                        required
                                    />
                                    <p className="form-hint">Must be a valid YouTube embed link.</p>
                                </div>
                            )}

                            {contentType === 'pdf' && (
                                <div className="form-group">
                                    <label>Document URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={lessonForm.pdf_url}
                                        onChange={(e) => setLessonForm({ ...lessonForm, pdf_url: e.target.value })}
                                        placeholder="https://drive.google.com/..."
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>
                                    {contentType === 'assignment' ? 'Instructions' : 'Description'}
                                </label>
                                <textarea
                                    className="form-textarea"
                                    value={lessonForm.description}
                                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    rows={contentType === 'assignment' ? 6 : 3}
                                    placeholder={contentType === 'assignment' ? "Detailed instructions for the assignment..." : "Brief description..."}
                                    required={contentType === 'assignment'}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowLessonForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Save Content' : (selectedLesson ? 'Update Content' : 'Add Content')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-state">Loading modules...</div>
            ) : modules.length === 0 ? (
                <div className="card empty-state">
                    <span className="empty-icon">📚</span>
                    <h3>No Modules Yet</h3>
                    <p>Create your first module or seed default content.</p>
                </div>
            ) : (
                <div className="modules-grid">
                    {modules.map((module) => (
                        <div key={module.id} className="module-card card">
                            <div className="module-header-row">
                                <span className="badge badge-primary">Week {module.week_number}</span>
                                <span className={`status-dot ${module.is_published ? 'active' : ''}`} title={module.is_published ? 'Published' : 'Draft'}></span>
                            </div>
                            <h4>{module.title}</h4>
                            <p className="module-desc">{module.description || 'No description provided.'}</p>

                            {/* Lessons List Preview */}
                            <div className="lessons-preview">
                                <h5>Content ({module.lectures?.length || 0})</h5>
                                <ul className="lessons-list">
                                    {module.lectures?.slice(0, 4).map(lesson => (
                                        <li key={lesson.id} className={`type-${lesson.content_type || 'video'}`}>
                                            <span className="lesson-icon">
                                                {lesson.content_type === 'video' && '🎥'}
                                                {lesson.content_type === 'supporting_video' && '📹'}
                                                {lesson.content_type === 'assignment' && '📝'}
                                                {lesson.content_type === 'pdf' && '📄'}
                                                {!lesson.content_type && '🎥'}
                                            </span>
                                            {lesson.title}
                                        </li>
                                    ))}
                                    {(module.lectures?.length || 0) > 4 && (
                                        <li className="more-lessons">+{module.lectures!.length - 4} more...</li>
                                    )}
                                </ul>
                            </div>

                            <div className="module-actions">
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => openAddContentModal(module)}
                                >
                                    + Add Content
                                </button>
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => openEditModuleModal(module)}
                                >
                                    Edit Module
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .form-card {
                    margin-bottom: var(--spacing-2xl);
                    background: var(--color-white);
                    padding: var(--spacing-xl);
                }

                .form-group {
                    margin-bottom: var(--spacing-lg);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-md);
                }

                .form-group label {
                    display: block;
                    margin-bottom: var(--spacing-xs);
                    font-weight: 500;
                }

                .form-hint {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                    margin-top: var(--spacing-xs);
                }

                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: var(--spacing-lg);
                }

                .module-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .module-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-md);
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--color-gray-300);
                }

                .status-dot.active {
                    background: var(--color-success);
                }

                .module-desc {
                    color: var(--color-gray-600);
                    font-size: 0.875rem;
                    margin-bottom: var(--spacing-lg);
                }

                .lessons-preview {
                    background: var(--color-gray-50);
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--spacing-lg);
                    flex: 1;
                }

                .lessons-preview h5 {
                    margin: 0 0 var(--spacing-sm) 0;
                    font-size: 0.875rem;
                    color: var(--color-gray-700);
                }

                .lessons-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .lessons-list li {
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .lessons-list li.type-supporting_video { color: var(--color-gray-500); font-style: italic; }
                .lessons-list li.type-assignment { color: var(--color-primary); font-weight: 500; }

                .more-lessons {
                    color: var(--color-primary) !important;
                    font-size: 0.75rem !important;
                    margin-top: 4px;
                }

                .module-actions {
                    display: flex;
                    gap: var(--spacing-sm);
                    margin-top: auto;
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-3xl);
                }

                .empty-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: var(--spacing-md);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: var(--spacing-md);
                }

                .modal-content {
                    background: var(--color-white);
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-2xl);
                }

                .modal-header {
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-gray-200);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--color-gray-500);
                }

                .modal-body {
                    padding: var(--spacing-lg);
                }

                .modal-footer {
                    margin-top: var(--spacing-xl);
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-md);
                }

                /* Manage Content List Styles */
                .manage-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-md);
                }

                .manage-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .manage-item:last-child {
                    border-bottom: none;
                }

                .item-info {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    overflow: hidden;
                }

                .item-title {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 250px;
                }

                .item-actions {
                    display: flex;
                    gap: var(--spacing-xs);
                }

                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 4px;
                    border-radius: 4px;
                }

                .btn-icon:hover {
                    background-color: var(--color-gray-100);
                }

                .btn-icon.delete:hover {
                    background-color: #fee2e2;
                }
            `}</style>
        </div>
    );
};

export default Courses;
