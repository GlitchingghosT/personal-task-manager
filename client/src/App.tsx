// import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./Pages/HomePage";
import MyTask from "./Pages/MyTask";
import NewTask from "./Pages/NewTask";
import EditTask from "./Pages/EditTask";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/MyTask" element={<MyTask />} />
          <Route path="/NewTask" element={<NewTask />} />
          <Route path="/EditTask" element={<EditTask />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
