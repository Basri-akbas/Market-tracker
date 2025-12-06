import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';

import Stats from './pages/Stats';
import SupplierList from './pages/SupplierList';
import SupplierDetail from './pages/SupplierDetail';
import SupplierStatistics from './pages/SupplierStatistics';
import ReturnsDashboard from './pages/ReturnsDashboard';
import SupplierReturns from './pages/SupplierReturns';

function App() {
  console.log('App component rendering');
  return (
    <ProductProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="search" element={<ProductList />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="supplier/:name" element={<SupplierDetail />} />
            <Route path="suppliers/:supplierName/stats" element={<SupplierStatistics />} />
            <Route path="stats" element={<Stats />} />
            <Route path="returns" element={<ReturnsDashboard />} />
            <Route path="returns/:supplierName" element={<SupplierReturns />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProductProvider>
  );
}

export default App;
