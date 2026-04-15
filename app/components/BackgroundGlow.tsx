export default function BackgroundGlow() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[160px] opacity-60" />
      
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-pink-600 rounded-full blur-[160px] opacity-60" />
      
      <div className="absolute top-[40%] left-[55%] w-[400px] h-[400px] bg-cyan-400 rounded-full blur-[160px] opacity-50" />
    
    </div>
  );
}