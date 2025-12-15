import { MessageCircle } from "lucide-react";

export default function FloatingEnquiryBar({ onEnquire }) {
  return (
    <button
      onClick={onEnquire}
      className="
        fixed bottom-24 right-6 z-50
        flex items-center gap-3
        px-5 py-3 rounded-full
        bg-[#164946] text-white
        shadow-2xl hover:scale-105 transition
      "
    >
      <MessageCircle />
      Enquire Now
    </button>
  );
}
