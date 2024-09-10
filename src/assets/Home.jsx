import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  UserPlus,
  LayoutDashboard,
  LogIn,
  User,
  Bed,
  Package,
} from "lucide-react";
import BedAssignment from "./Beds";
import HospitalInventoryManager from "./Hospital_Inventory";
import HospitalPatientsDisplay from "./Patients";

const HomePage = () => {
  return (
    <Router>
      <div className="h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-white font-bold text-xl">
              <NavItem text="Hospital Management" to="/" />
            </div>
            <ul className="flex space-x-4 gap-8">
              <NavItem icon={<Home size={18} />} text="Home" to="/" />
              <NavItem
                icon={<UserPlus size={18} />}
                text="Create Health ID"
                to="https://abha.abdm.gov.in/abha/v3/"
              />
              <NavItem
                icon={<LayoutDashboard size={18} />}
                text="Dashboard"
                to="/dashboard"
              />
              <NavItem icon={<LogIn size={18} />} text="Login" to="/login" />
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/Beds" element={<BedAllot />} />
          <Route path="/Hospital_Inventory" element={<Inven />} />
          <Route path="/Patients" element={<AllPatients />} />
        </Routes>
      </div>
    </Router>
  );
};

const MainContent = () => {
  const navigate = useNavigate();

  return (
    <main className="h-full container mx-auto mt-8 p-4">
      <h1 className="text-5xl font-bold mb-8 text-center">Services</h1>
      <div className="h-3/5 grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center my-auto">
        <Card
          title="Patient Info"
          icon={<User size={40} />}
          color="bg-green-500"
          description="Manage and view patient information and medical records."
          onClick={() => navigate("/Patients")}
        />
        <Card
          title="Bed Allotment"
          icon={<Bed size={40} />}
          color="bg-yellow-500"
          description="Check bed availability and manage patient assignments."
          onClick={() => navigate("/beds")}
        />
        <Card
          title="Inventory Management"
          icon={<Package size={40} />}
          color="bg-purple-500"
          description="Track and manage hospital supplies and equipment."
          onClick={() => navigate("/Hospital_Inventory")}
        />
      </div>
    </main>
  );
};

const NavItem = ({ icon, text, to }) => (
  <li>
    <Link to={to} className="text-white hover:text-gray-300 flex items-center">
      {icon}
      <span className="ml-1">{text}</span>
    </Link>
  </li>
);

const Card = ({ title, icon, color, description, onClick }) => (
  <div
    className={`${color} rounded-lg h-64 shadow-lg p-6 text-white transition-transform hover:scale-105 flex flex-col place-items-center w-4/5 cursor-pointer`}
    onClick={onClick}
  >
    <div className="flex mb-4 place-items-centre">
      {icon}
      <h2 className="text-2xl mt-1 font-bold ml-4  text-center ">{title}</h2>
    </div>
    <p className="flex h-3/4 flex-wrap text-center mt-4">{description}</p>
  </div>
);

const BedAllot = () => {
  return (
    <div className="container mx-auto mt-8 p-4 text-center">
      <h1 className=" text-3xl font-bold mb-8">Bed Allotment</h1>
      <BedAssignment />
    </div>
  );
};

const Inven = () => {
  return (
    <div className="container mx-auto mt-8 p-4 text-center">
      <h1 className=" text-3xl font-bold mb-8">Inventory Manager</h1>
      <HospitalInventoryManager />
    </div>
  );
};
const AllPatients = () => {
  return (
    <div className="container mx-auto mt-8 p-4 text-center">
      <h1 className=" text-3xl font-bold mb-8">Patients Info</h1>
      <HospitalPatientsDisplay />
    </div>
  );
};

export default HomePage;
