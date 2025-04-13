
export function AboutSection() {
  return (
    <section id="about" className="py-20 container-padding bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About SmartPad</h2>
          <div className="h-1 w-20 bg-smartpad-blue mx-auto rounded-full"></div>
        </div>
        
        <div className="glass-card p-8 rounded-2xl">
          <p className="text-lg mb-6 leading-relaxed">
            SmartPad reimagines the classic notepad experience for the AI era. We've taken the simple, 
            distraction-free writing environment you love and enhanced it with intuitive AI features 
            that help you write better, organize smarter, and collaborate seamlessly.
          </p>
          
          <p className="text-lg mb-6 leading-relaxed">
            Our mission is to create a writing tool that feels familiar yet futuristic—combining the 
            minimalism of traditional notepads with the intelligence of modern AI to help you capture 
            and develop your ideas.
          </p>
          
          <p className="text-lg leading-relaxed">
            Whether you're drafting important documents, jotting down quick ideas, or collaborating with 
            a team, SmartPad adapts to your workflow while keeping everything beautifully simple.
          </p>
        </div>
      </div>
    </section>
  );
}
