const InlineLoader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex items-center justify-center space-x-2 py-6">
      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
      <span>{text}</span>
    </div>
  );
};

export default InlineLoader;
