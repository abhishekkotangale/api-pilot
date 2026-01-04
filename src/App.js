import { BrowserRouter, Route, Routes } from "react-router-dom";
import ApiRequestTool from "./pages/ApiRequestTool";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedLayout from "./ProtectedLayout";



const App = () => {
  return (

      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<ApiRequestTool />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

  );
};

export default App;
