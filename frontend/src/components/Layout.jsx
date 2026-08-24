import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex">
      <Navbar />
      <main className="flex-1 flex justify-center overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
