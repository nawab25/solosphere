import { createBrowserRouter } from "react-router-dom";
import Main from "../layouts/Main";
import Home from "../pages/Home";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import JobDetails from "../pages/JobDetails";
import AddJob from "../pages/AddJob";
import MyPostedJobs from "../pages/MyPostedJobs";
import UpdateJob from "../pages/UpdateJob";
import MyBids from "../pages/MyBids";
import BidRequests from "../pages/BidRequests";
import AllJobs from "../pages/AllJobs";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main></Main>,
        children: [
            {
                index: true,
                element: <Home></Home>
            },
            {
                path: "/login",
                element: <Login></Login>
            },
            {
                path: "/register",
                element: <Register></Register>
            },
            {
                path: "/job/:id",
                element: <JobDetails></JobDetails>,
                loader: ({params}) => fetch(`${import.meta.env.VITE_API_URL}/job/${params.id}`)    
            },
            {
                path: "/jobs/:id",
                element: <UpdateJob></UpdateJob>,
                loader: ({params}) => fetch(`${import.meta.env.VITE_API_URL}/job/${params.id}`)    
            },
            {
                path: "/add-job",
                element: <AddJob></AddJob>
            },
            {
                path: "/my-posted-jobs",
                element: <MyPostedJobs></MyPostedJobs>
            },
            {
                path: "/my-bids",
                element: <MyBids></MyBids>
            },
            {
                path: "/bid-requests",
                element: <BidRequests></BidRequests>
            },
            {
                path: "/all-jobs",
                element: <AllJobs></AllJobs>
            },
        ]
    }
]);

export default router;