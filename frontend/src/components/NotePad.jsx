import React from "react";
import NotePadHeader from "./NotePadHeader";

const NotePad = () => {
    return (
        <div className="min-h-screen bg-[#FDEBD0]">
            <NotePadHeader />
            <div className="p-4">
                <textarea 
                    className="w-full h-[calc(100vh-80px)] p-4 border border-gray-300 rounded-lg shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Start typing your notes here..."
                ></textarea>
            </div>
        </div>
    );
};