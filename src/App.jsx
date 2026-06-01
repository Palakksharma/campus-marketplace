import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./common/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Chats from "./pages/Chats";
import MyListing from "./pages/MyListing";
import ProductDetail from "./pages/ProductDetail";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import "react-toastify/dist/ReactToastify.css";
import MyProfile from "./pages/auth/MyProfile";
import Signout from "./pages/auth/Signout";
import { Provider } from "react-redux";
import { store } from "./redux/stores/store";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/products",
          element: <Products />,
        },
        {
          path: "/product/:id",
          element: <ProductDetail />,
        },

        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "/wishlist",
              element: <Wishlist />,
            },
            {
              path: "/orders",
              element: <Orders />,
            },
            {
              path: "/chats",
              element: <Chats />,
            },
            {
              path: "/my-listing",
              element: <MyListing />,
            },
          ],
        },
        {
          element: <AuthenticatedRoute />,
          children: [
            {
              path: "/my-profile",
              element: <MyProfile />,
            },
            {
              path: "/signOut",
              element: <Signout />,
            },
          ],
        },

        {
          element: <AdminRoute />,
          children: [
            {
              path: "/admin/dashboard",
              element: <AdminDashboard />,
            },
            {
              path: "/admin/users",
              element: <AdminUsers />,
            },
            {
              path: "/admin/products",
              element: <AdminProducts />,
            },
            {
              path: "/admin/orders",
              element: <AdminOrders />,
            },
          ],
        },

        {
          path: "/signup",
          element: <Signup />,
        },
        {
          path: "/signin",
          element: <Signin />,
        },
      ],
    },
  ]);
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
}

export default App;