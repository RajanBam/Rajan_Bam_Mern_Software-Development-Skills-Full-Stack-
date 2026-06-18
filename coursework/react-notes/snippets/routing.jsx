// react-router-dom basics from the crash course: a couple of routes, links and
// reading a URL parameter. This is the same shape as Inkboard's real router.
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Home</h1>
      <Link to="/board/42">Open board 42</Link>
      <button onClick={() => navigate('/board/99')}>Go to 99</button>
    </div>
  );
}

function Board() {
  const { id } = useParams(); // read ":id" from the path
  return <h1>Board #{id}</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:id" element={<Board />} />
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
