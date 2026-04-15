

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome Back
        </h1>

        <form className="space-y-4">
          
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none"
          />

          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold hover:opacity-90 transition">
            Login
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Don’t have an account? Sign up
        </p>

      </div>
    </div>
  );
}