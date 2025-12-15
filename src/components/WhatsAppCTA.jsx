export default function WhatsAppCTA({ phone, message }) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-green-500 text-white
        flex items-center justify-center
        shadow-xl hover:scale-110 transition
      "
    >
      <svg viewBox="0 0 32 32" width="28" fill="currentColor">
        <path d="M19.11 17.205c-.372-.186-2.2-1.084-2.54-1.207-.34-.124-.59-.186-.84.186-.25.372-.97 1.207-1.19 1.456-.22.248-.43.28-.8.093-.37-.186-1.56-.575-2.97-1.83-1.1-.98-1.84-2.19-2.06-2.56-.22-.372-.02-.573.17-.76.17-.17.37-.43.56-.65.19-.22.25-.372.37-.62.12-.248.06-.465-.03-.65-.09-.186-.84-2.02-1.15-2.77-.3-.72-.61-.62-.84-.63l-.72-.01c-.25 0-.65.093-.99.465-.34.372-1.3 1.27-1.3 3.1s1.33 3.6 1.52 3.85c.19.248 2.6 4 6.3 5.6.88.38 1.56.61 2.1.78.88.28 1.68.24 2.31.15.71-.11 2.2-.9 2.51-1.77.31-.87.31-1.62.22-1.77-.09-.15-.34-.25-.71-.43z" />
      </svg>
    </a>
  );
}
