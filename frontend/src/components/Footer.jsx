import { BiTask } from "react-icons/bi";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <BiTask className="text-white text-sm" />
          </div>
          <span className="font-semibold text-gray-700">TeamTasks</span>
          <span className="text-gray-300">•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          Built with <Heart size={12} className="text-red-400 fill-red-400" /> for team productivity
        </p>
      </div>
    </footer>
  );
};

export default Footer;
