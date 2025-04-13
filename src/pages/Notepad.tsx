import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, Italic, List, ListOrdered, AlignLeft, 
  Star, Users, FileText, CheckSquare, Mic,
  Plus, Clock, Search, Settings, Save, Menu, MicOff, X, 
  Eraser,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { CollaborationProvider, useCollaboration } from '@/contexts/CollaborationContext';
import { CollaborationPanel } from '@/components/collaboration/CollaborationPanel';

// Add SpeechRecognition type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
};

// Add this utility function to detect markdown opportunities
const detectAndFormatText = (text: string) => {
  // Set up patterns to detect formattable content
  const patterns = [
    // Tasks
    { pattern: /\b(TODO|TASK):\s*(.+)/gi, replacement: '- [ ] $2' },
    // Important notes
    { pattern: /\b(IMPORTANT|NOTE|WARNING):\s*(.+)/gi, replacement: '**$1:** $2' },
    // Headers for capitalized phrases followed by colon
    { pattern: /^([A-Z][a-z]{2,}):\s*(.+)/gm, replacement: '# $1\n$2' },
    // Dates
    { pattern: /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}):\s*(.+)/gm, replacement: '**$1:** $2' },
    // Lists with * or - that aren't already formatted
    { pattern: /^(\s*)[*-](?!\s?\[[ x]\])\s(.+)/gm, replacement: '$1- $2' },
    // Numbered lists
    { pattern: /^(\s*)(\d+)[\.\)]\s+(.+)/gm, replacement: '$1$2. $3' },
  ];

  let formatted = false;
  let formattedText = text;

  // Check if any pattern matches
  for (const { pattern } of patterns) {
    if (pattern.test(text)) {
      formatted = true;
      break;
    }
  }

  return { formatted, formattedText };
};

// Format patterns used by the smart formatting system
const formatPatterns = {
  heading: /^(#{1,6})\s+/,
  list: /^[-*]\s+/,
  numberedList: /^\d+\.\s+/,
  task: /\b(TODO|TASK):/i,
  important: /^(!+|\*\*\*|\b(IMPORTANT|NOTE|WARNING)\b):/i,
};

const NotepadContent = () => {
  const [activeSection, setActiveSection] = useState<"notes" | "tasks" | "favorites" | "collaboration">("notes");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "New Note",
      content: "", // Empty content
      category: "General",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Meeting notes - Project Kickoff",
      content: "# Project Kickoff Meeting\n\n## Attendees\n- John Smith\n- Jane Doe\n- Alex Johnson\n\n## Agenda\n1. Project overview\n2. Timeline discussion\n3. Resource allocation\n4. Next steps",
      category: "Work",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  ]);
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      completed: false,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      title: "Review documentation",
      completed: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  ]);
  
  const [activeNote, setActiveNote] = useState<Note | null>(notes[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const [aiSuggestions, setAiSuggestions] = useState([
    "Create task from this meeting note",
    "Categorize under Work projects", 
    "Set a reminder for the follow-up"
  ]);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [temporaryTranscript, setTemporaryTranscript] = useState("");
  
  // Add a new state for displaying a tip about smart formatting
  const [showFormatTip, setShowFormatTip] = useState(true);
  
  // Add prevTextLength ref
  const prevTextLength = useRef<number>(0);
  
  const { socket, currentUser } = useCollaboration();

  // Add real-time content sync
  useEffect(() => {
    if (!socket || !activeNote) return;

    const handleContentUpdate = (data: { noteId: string; content: string; updatedAt: Date }) => {
      if (data.noteId !== activeNote.id) return;

      setNotes(notes.map(note =>
        note.id === data.noteId
          ? { ...note, content: data.content, updatedAt: new Date(data.updatedAt) }
          : note
      ));
    };

    socket.on('note:update', handleContentUpdate);

    return () => {
      socket.off('note:update', handleContentUpdate);
    };
  }, [socket, activeNote]);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Function to clean up transcribed text
      const cleanTranscript = (text: string): string => {
        const original = text;
        
        // Remove common speech recognition errors and unwanted phrases
        const cleaned = text
          // Remove welcome messages and AI-related phrases
          .replace(/\bplus AI prefix\b/gi, '')
          .replace(/\bAI prefix\b/gi, '')
          .replace(/\bprefix\b/gi, '')
          .replace(/\bplus AI\b/gi, '')
          .replace(/\bwelcome to NotepadX\b/gi, '')
          .replace(/\bwelcome to NotepadX\b/gi, '')
          .replace(/\bNotepadX\b/gi, 'NotepadX')
          .replace(/\byour thoughts organized enhanced and intelligent\b/gi, '')
          .replace(/\bstart typing and let AI do the rest\b/gi, '')
          // Fix common name misrecognitions
          .replace(/\btext net\b/gi, 'textnet')
          .replace(/\bTextNet\b/gi, 'Textnet')
          .replace(/\btechNet\b/gi, 'Textnet')
          .replace(/\btech net\b/gi, 'textnet')
          // Fix punctuation for common speech commands
          .replace(/\bperiod\b/gi, '.')
          .replace(/\bcomma\b/gi, ',')
          .replace(/\bquestion mark\b/gi, '?')
          .replace(/\bexclamation mark\b/gi, '!')
          .replace(/\bexclamation point\b/gi, '!')
          .replace(/\bnew line\b/gi, '\n')
          .replace(/\bnew paragraph\b/gi, '\n\n')
          // Clean multiple spaces
          .replace(/\s+/g, ' ')
          .trim();
        
        // Show feedback if substantial cleaning was done (more than 5 characters difference)
        if (original.length - cleaned.length > 5) {
          setTimeout(() => {
            toast({
              title: "Voice Text Cleaned",
              description: "Removed some speech recognition artifacts",
              duration: 2000,
            });
          }, 100);
        }
        
        return cleaned;
      };
      
      recognition.onresult = (event) => {
        if (!activeNote) return;
        
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        // Show the temporary transcript for the latest result
        const currentResult = event.results[event.results.length - 1];
        setTemporaryTranscript(currentResult[0].transcript);
        
        // Clean the transcript before using it
        const cleanedTranscript = cleanTranscript(transcript);
        
        if (event.results[0].isFinal) {
          // Insert text at cursor position or append to end
          if (editorRef.current) {
            const start = editorRef.current.selectionStart;
            const end = editorRef.current.selectionEnd;
            
            // Check if this is the first input in the note, and if so, replace content
            // instead of appending to it
            const isFirstInput = activeNote.content.trim() === "" || 
                                activeNote.content.includes("Welcome to NotepadX") ||
                                activeNote.content.includes("Your thoughts, organized");
            
            const newContent = isFirstInput
              ? cleanedTranscript  // Replace content
              : activeNote.content.substring(0, start) + 
                cleanedTranscript + 
                activeNote.content.substring(end);
            
            const updatedNote = { 
              ...activeNote, 
              content: newContent,
              updatedAt: new Date()
            };
            
            setActiveNote(updatedNote);
            setNotes(notes.map(note => 
              note.id === activeNote.id ? updatedNote : note
            ));
            
            // Update cursor position
            setTimeout(() => {
              if (editorRef.current) {
                const newPosition = isFirstInput 
                  ? cleanedTranscript.length 
                  : start + cleanedTranscript.length;
                editorRef.current.focus();
                editorRef.current.setSelectionRange(newPosition, newPosition);
              }
            }, 0);
            
            // Clear temporary transcript
            setTemporaryTranscript("");
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };
      
      setSpeechRecognition(recognition);
    }
    
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);
  
  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!speechRecognition) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isListening) {
        speechRecognition.stop();
        setIsListening(false);
        setTemporaryTranscript("");
        toast({
          title: "Voice Input Stopped",
          description: "Voice input has been turned off.",
        });
      } else {
        // Reset any previous transcript
        setTemporaryTranscript("");
        
        // Start recognition with retry logic
        const startRecognition = () => {
          try {
            speechRecognition.start();
            setIsListening(true);
            toast({
              title: "Voice Input Active",
              description: "Speak clearly to add text to your note.",
            });
          } catch (error) {
            console.error("Failed to start speech recognition:", error);
            // If it's already running, stop it first and then try again
            speechRecognition.stop();
            setTimeout(() => {
              try {
                speechRecognition.start();
                setIsListening(true);
                toast({
                  title: "Voice Input Active",
                  description: "Speak clearly to add text to your note.",
                });
              } catch (retryError) {
                console.error("Failed to restart speech recognition:", retryError);
                toast({
                  title: "Speech Recognition Error",
                  description: "Failed to start voice input. Please try again.",
                  variant: "destructive"
                });
                setIsListening(false);
              }
            }, 300);
          }
        };
        
        startRecognition();
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
      toast({
        title: "Speech Recognition Error",
        description: "An error occurred with voice input. Please try again.",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };
  
  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter tasks based on completed status and search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Create a new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",  // Empty content by default - no welcome text
      category: "General",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    
    toast({
      title: "Note Created",
      description: "A new note has been created.",
    });
  };
  
  // Clear the active note content
  const clearNoteContent = () => {
    if (activeNote) {
      const updatedNote = {
        ...activeNote,
        content: "",
        updatedAt: new Date()
      };
      
      setActiveNote(updatedNote);
      setNotes(notes.map(note => 
        note.id === activeNote.id ? updatedNote : note
      ));
      
      toast({
        title: "Note Cleared",
        description: "Your note content has been cleared.",
      });
    }
  };
  
  // Toggle task completion status
  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, completed: !task.completed };
        
        toast({
          title: updatedTask.completed ? "Task Completed" : "Task Reopened",
          description: updatedTask.title,
        });
        
        return updatedTask;
      }
      return task;
    }));
  };
  
  // Add a new task
  const handleCreateTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      completed: false,
      createdAt: new Date(),
    };
    
    setTasks([newTask, ...tasks]);
    
    toast({
      title: "Task Created",
      description: "A new task has been created.",
    });
  };
  
  // Save note (simulate saving to backend)
  const handleSaveNote = () => {
    if (activeNote) {
      // In a real app, this would send data to a backend
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });
    }
  };
  
  // Update note content
  const handleNoteContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeNote) {
      const updatedNote = { 
        ...activeNote, 
        content: e.target.value,
        updatedAt: new Date()
      };
      setActiveNote(updatedNote);
      
      // Update note in the notes array
      setNotes(notes.map(note => 
        note.id === activeNote.id ? updatedNote : note
      ));
      
      // Generate AI suggestions based on content
      if (e.target.value.includes("meeting") || e.target.value.includes("agenda")) {
        setAiSuggestions([
          "Create task from this meeting note",
          "Add participants from your contacts",
          "Schedule a follow-up meeting"
        ]);
      } else if (e.target.value.includes("todo") || e.target.value.includes("task")) {
        setAiSuggestions([
          "Convert to task list",
          "Set deadlines for these items",
          "Prioritize these tasks"
        ]);
      }
    }
  };
  
  // Update note title
  const handleNoteTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeNote) {
      const updatedNote = { 
        ...activeNote, 
        title: e.target.value,
        updatedAt: new Date()
      };
      setActiveNote(updatedNote);
      
      // Update note in the notes array
      setNotes(notes.map(note => 
        note.id === activeNote.id ? updatedNote : note
      ));
    }
  };
  
  // Toggle favorite status (would need to add this property to notes)
  const toggleFavorite = (noteId: string) => {
    // Implementation would go here
  };
  
  // Convert current note to HTML for display (basic markdown support)
  const getFormattedContent = () => {
    if (!activeNote) return "";
    // This would be a place to implement a more sophisticated markdown parser
    return activeNote.content;
  };
  
  // Apply text formatting (bold, italic, etc.)
  const applyFormatting = (type: string) => {
    if (!editorRef.current) return;
    
    const textArea = editorRef.current;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
    
    let formattedText = "";
    let cursorAdjustment = 0;
    
    switch (type) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorAdjustment = 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorAdjustment = 1;
        break;
      case "list":
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        cursorAdjustment = 2;
        break;
      case "ordered-list":
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        cursorAdjustment = 3;
        break;
      default:
        return;
    }
    
    if (activeNote) {
      const newContent = 
        activeNote.content.substring(0, start) + 
        formattedText + 
        activeNote.content.substring(end);
      
      const updatedNote = { 
        ...activeNote, 
        content: newContent,
        updatedAt: new Date()
      };
      
      setActiveNote(updatedNote);
      setNotes(notes.map(note => 
        note.id === activeNote.id ? updatedNote : note
      ));
      
      // Set cursor position after update
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(
            start + cursorAdjustment, 
            end + cursorAdjustment
          );
        }
      }, 0);
    }
  };
  
  // Add the handleSmartFormatting function
  const handleSmartFormatting = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNote || !socket) return;

    const text = e.target.value;
    const selection = e.target.selectionStart;
    const keyCount = (text.match(/\S/g) || []).length;
    
    // Get the current line
    const lines = text.split('\n');
    let currentLineIndex = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1; // +1 for newline character
      if (charCount >= selection) {
        currentLineIndex = i;
        break;
      }
    }
    
    const currentLine = lines[currentLineIndex];
    
    // Check if the user just typed a trigger character like *, -, or #
    const hasJustTypedTrigger = 
      selection > 0 && 
      ['*', '-', '#', '>', ':'].includes(text.charAt(selection - 1)) &&
      (selection === 1 || text.charAt(selection - 2) === '\n' || text.charAt(selection - 2) === ' ');

    // Check if the user just pressed Enter (detect the insert of a newline)
    const hasJustPressedEnter = 
      selection > 0 && 
      text.charAt(selection - 1) === '\n';
    
    // Format when:
    // 1. The user types a trigger character, or
    // 2. The user presses Enter after a formatted line, or
    // 3. Every 20 keystrokes for passive scanning
    // 4. When text length changes by 10 (batch processing)
    if (
      hasJustTypedTrigger ||
      hasJustPressedEnter ||
      keyCount % 20 === 0 ||
      Math.abs((text?.length || 0) - (prevTextLength.current || 0)) > 10
    ) {
      // Check the current line for formatting opportunities
      const { formatted, formattedText } = detectAndFormatText(currentLine);
      
      if (formatted) {
        // Replace the current line with the formatted text
        lines[currentLineIndex] = formattedText;
        const newContent = lines.join('\n');
        
        // Save the formatted note
        const updatedNote = {
          ...activeNote,
          content: newContent,
          updatedAt: new Date()
        };
        
        // Update the note content
        setNotes(notes.map(note => 
          note.id === activeNote.id ? updatedNote : note
        ));
        
        // Track the selection to restore cursor position after formatting
        const selectionDiff = formattedText.length - currentLine.length;
        const newSelectionPosition = selection + selectionDiff;
        
        // Set timeout to allow rendering to complete before setting selection
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = newSelectionPosition;
            editorRef.current.selectionEnd = newSelectionPosition;
          }
        }, 0);
        
        // Show feedback to the user
        toast({
          title: "Smart Formatting Applied",
          description: "Formatting applied to your text"
        });
        
        // Suggest formatting if we did some formatting
        if (!aiSuggestions.includes("Format text with markdown styling")) {
          setAiSuggestions(prevSugs => ["Format text with markdown styling", ...prevSugs.slice(0, 2)]);
        }

        // Emit content update to other users
        socket.emit('note:update', {
          noteId: activeNote.id,
          content: newContent,
          updatedAt: new Date()
        });
        
        return;
      }
    }
    
    // If no formatting applied, handle normal content change
    handleNoteContentChange(e);
    
    // Update the text length for next comparison
    prevTextLength.current = text?.length || 0;
  }, [activeNote, socket, notes, setNotes, aiSuggestions, handleNoteContentChange]);
  
  // Update the applySuggestion function to handle smart formatting
  const applySuggestion = (suggestion: string) => {
    if (suggestion === "Create task from this meeting note" && activeNote) {
      // Existing implementation...
      const newTask: Task = {
        id: Date.now().toString(),
        title: `Task from: ${activeNote.title}`,
        completed: false,
        createdAt: new Date(),
      };
      
      setTasks([newTask, ...tasks]);
      setActiveSection("tasks");
      
      toast({
        title: "Task Created",
        description: `New task created from note: ${activeNote.title}`,
      });
    } else if (suggestion === "Format text with markdown styling" && activeNote) {
      // Apply smart formatting to the entire note
      const { formattedText, formatted } = detectAndFormatText(activeNote.content);
      
      if (formatted) {
        const updatedNote = {
          ...activeNote,
          content: formattedText,
          updatedAt: new Date()
        };
        
        setActiveNote(updatedNote);
        setNotes(notes.map(note => 
          note.id === activeNote.id ? updatedNote : note
        ));
        
        toast({
          title: "Text Formatted",
          description: "Applied smart formatting to your note",
        });
      } else {
        toast({
          title: "No Formatting Needed",
          description: "Your text is already well formatted!",
        });
      }
    } else if (suggestion === "Convert to task list" && activeNote) {
      // Implementation would convert note lines to tasks
      toast({
        title: "Suggestion Applied",
        description: "Converting note content to tasks...",
      });
    } else {
      toast({
        title: "Suggestion Applied",
        description: suggestion,
      });
    }
  };

  // Clear note and start voice input
  const clearAndStartVoiceInput = () => {
    if (activeNote) {
      // Clear the note content
      const updatedNote = {
        ...activeNote,
        content: "",
        updatedAt: new Date()
      };
      
      setActiveNote(updatedNote);
      setNotes(notes.map(note => 
        note.id === activeNote.id ? updatedNote : note
      ));
      
      // Start voice input after a small delay to ensure UI is updated
      setTimeout(() => {
        if (speechRecognition) {
          try {
            speechRecognition.start();
            setIsListening(true);
            toast({
              title: "Ready to Dictate",
              description: "Note cleared and voice input activated",
            });
          } catch (error) {
            console.error("Failed to start speech recognition:", error);
            toast({
              title: "Speech Recognition Error",
              description: "Failed to start voice input. Please try again.",
              variant: "destructive"
            });
          }
        }
      }, 100);
    }
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow flex flex-col">
          <div className="border-b p-2 flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden transition-colors hover:bg-muted/50 active:bg-muted/70"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold ml-2">NotepadX</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-colors hover:bg-muted/50 active:bg-muted/70"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSaveNote}
                className="transition-colors hover:bg-muted/50 active:bg-muted/70"
              >
                <Save className="h-5 w-5" />
              </Button>
              {activeNote && activeNote.content && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearNoteContent}
                  className="transition-colors hover:bg-muted/50 active:bg-muted/70"
                  title="Clear note content"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className={`w-64 border-r bg-muted/10 flex-shrink-0 overflow-y-auto ${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
              <div className="p-4">
                <Button 
                  onClick={handleCreateNote}
                  className="w-full mb-4 transition-colors hover:bg-smartpad-blue/90 active:bg-smartpad-blue/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
                
                <div className="space-y-1">
                  <Button
                    variant={activeSection === "notes" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("notes")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </Button>
                  <Button
                    variant={activeSection === "tasks" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("tasks")}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Tasks
                  </Button>
                  <Button
                    variant={activeSection === "favorites" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("favorites")}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                  <Button
                    variant={activeSection === "collaboration" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("collaboration")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Collaboration
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                {activeSection === "notes" && (
                  <div className="space-y-2">
                    {filteredNotes.map(note => (
                      <div
                        key={note.id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          activeNote?.id === note.id 
                            ? 'bg-smartpad-blue/20 text-smartpad-blue' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setActiveNote(note)}
                      >
                        <div className="font-medium">{note.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeSection === "tasks" && (
                  <div className="space-y-2">
                    {filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleTaskComplete(task.id)}
                      >
                        <div className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <CheckSquare className={`h-4 w-4 ${task.completed ? 'text-green-500' : ''}`} />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      onClick={handleCreateTask}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Editor Area */}
              <div className="flex-1 p-4 overflow-auto">
                {activeNote ? (
                  <div className="max-w-3xl mx-auto">
                    <Input
                      value={activeNote.title}
                      onChange={handleNoteTitleChange}
                      className="text-2xl font-bold mb-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    
                    {showFormatTip && (
                      <div className="bg-smartpad-blue/10 p-2 text-xs text-muted-foreground flex justify-between items-center">
                        <span>
                          <span className="font-medium text-smartpad-blue">Smart Formatting:</span> Try typing "TODO:", "IMPORTANT:", or start a list to see auto-formatting in action!
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowFormatTip(false)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                    
                    <Textarea
                      ref={editorRef}
                      value={activeNote.content}
                      onChange={handleSmartFormatting}
                      className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none font-mono"
                      placeholder="Start typing here..."
                    />
                    
                    {/* Voice Recognition Floating Button */}
                    <div className="fixed bottom-20 right-10 flex flex-col gap-3">
                      {/* Clear and Dictate Button */}
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={clearAndStartVoiceInput}
                        className="rounded-full h-12 w-12 border-2 shadow-md transition-all duration-300 hover:bg-green-500/10 hover:border-green-500"
                        title="Clear note and start dictation"
                      >
                        <Eraser className="h-5 w-5" />
                      </Button>
                    
                      {/* Toggle Voice Recognition Button */}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`rounded-full h-12 w-12 border-2 shadow-md transition-all duration-300 
                          ${isListening 
                            ? 'bg-smartpad-blue/20 border-smartpad-blue text-smartpad-blue animate-pulse' 
                            : 'hover:bg-smartpad-blue/10 hover:border-smartpad-blue'}`}
                        onClick={toggleSpeechRecognition}
                      >
                        {isListening ? (
                          <MicOff className="h-5 w-5" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Voice Recognition Status */}
                    {isListening && (
                      <div className="fixed bottom-14 right-10 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg text-sm shadow-md max-w-[300px] text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="font-medium">Listening...</span>
                        </div>
                        <div className="text-muted-foreground text-xs truncate">
                          {temporaryTranscript || "Speak now..."}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl font-medium mb-2">No note selected</h3>
                      <p className="text-muted-foreground mb-4">Select a note from the sidebar or create a new one</p>
                      <Button 
                        onClick={handleCreateNote}
                        className="transition-colors hover:bg-smartpad-blue/90 active:bg-smartpad-blue/80"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Replace AI Suggestions with Collaboration Panel when in collaboration mode */}
              <div className="w-80 border-l bg-muted/10 overflow-y-auto hidden md:block">
                {activeSection === "collaboration" && activeNote ? (
                  <CollaborationPanel noteId={activeNote.id} />
                ) : (
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="suggestion-card"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-smartpad-blue/10 rounded p-1">
                              <FileText className="h-4 w-4 text-smartpad-blue" />
                            </div>
                            <span className="text-sm font-medium">{suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

// Wrap the main component with CollaborationProvider
const Notepad = () => {
  return (
    <CollaborationProvider>
      <NotepadContent />
    </CollaborationProvider>
  );
};

export default Notepad; 