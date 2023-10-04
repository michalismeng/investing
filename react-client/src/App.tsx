import { useEffect } from 'react';
import './App.css';
import { Facts } from './Facts';
import { Header } from './Header';
import { Route, BrowserRouter as Router, Routes, NavLink } from 'react-router-dom';
import { Companies } from './Companies';
import { DownloadFMP } from './DownloadFMP';

function App() {

  useEffect(() => {
    function handleKeyDown(e: any) {
      // The '/' key code
      if(e.keyCode == 191) {
        console.log("Show actions modal")
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);


  return (
    <Router >
      <div className='container-fluid d-flex flex-column h-100'>
        <div className='row mb-5 d-flex align-items-center justify-content-around'>
            <Header />
        </div>
        <div className='row flex-grow-1 flex-shrink-1 fixed'>
          <Routes>
            <Route path="/" element={<Companies />} />
            <Route path="/companies/:name/fmp" element={<Facts />} />
            <Route path="/companies/:name/download-fmp" element={<DownloadFMP />} />
          </Routes>
        </div>
        <div className='row d-flex align-items-center justify-content-around mt-auto'>
          <i className='p-0 m-0 text-reset'>
            Stock Research Platform 2023
          </i>
        </div>
      </div>
    </Router>
  )
}

export default App;
