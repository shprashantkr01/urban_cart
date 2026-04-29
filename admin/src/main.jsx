import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

//createRoot().render() together mounts the App in the html DOM.
ReactDOM.createRoot(document.getElementById('root')).render(
  //BrowserRouter enables the routing between different pages.
  <BrowserRouter> 
    <App />
  </BrowserRouter>,
)
