import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import apiClient from "../../api/apiClient";
import CircularProgress from "@mui/material/CircularProgress";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text, "text"); 
    setText(""); 
  };

  const handleAttachClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await apiClient.post("/chat/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.imageUrl) {
        onSendMessage(response.data.imageUrl, "image");
        toast.success("Attachment sent!");
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || "Failed to send image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div 
      className="p-4 border-t backdrop-blur-md" 
      style={{ 
        borderColor: "var(--mui-palette-divider)", 
        backgroundColor: "var(--mui-palette-background-paper)" 
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-full relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          style={{ display: "none" }} 
          onChange={handleFileChange}
        />
        
        {/* Attachment Button */}
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={uploading}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-solid outline-none active:scale-95 ${
            uploading 
              ? "cursor-not-allowed opacity-50" 
              : "cursor-pointer hover:bg-gray-500/10"
          }`}
          style={{ 
            borderColor: "var(--mui-palette-divider)",
            backgroundColor: "transparent",
            color: "var(--mui-palette-text-primary)"
          }}
        >
          {uploading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Craft your message..."
          className="flex-1 px-5 py-3.5 bg-gray-500/5 border rounded-2xl text-sm font-medium outline-none transition-all focus:bg-gray-500/10"
          style={{ 
            borderColor: "var(--mui-palette-divider)",
            color: "var(--mui-palette-text-primary)"
          }}
          disabled={uploading}
        />
        
        <button
          type="submit"
          disabled={!text.trim() || uploading}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg border-0 outline-none ${
            text.trim() && !uploading
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
              : "bg-gray-500/10 text-gray-400 opacity-40 cursor-not-allowed shadow-none"
          }`}
        >
          {/* Unified Blue Arrow Send Icon */}
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;