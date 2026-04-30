// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';

// const Collection = () => {

//   const { products, search, showSearch } = useContext(ShopContext);
//   const [showFilter, setShowFilter] = useState(false);
//   const [filterProducts, setFilterProducts] = useState([]);
//   const [category, setCategory] = useState([]);
//   const [subCategory, setSubCategory] = useState([]);
//   const [sortType, setSortType] = useState('relavent')
//   const [aiFilters, setAiFilters] = useState(null);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [debouncedSearch, setDebouncedSearch] = useState("");




//   const toggleCategory = (e) => {

//     if (category.includes(e.target.value)) {
//       setCategory(prev => prev.filter(item => item !== e.target.value))
//     }
//     else {
//       setCategory(prev => [...prev, e.target.value])
//     }

//   }

//   const toggleSubCategory = (e) => {

//     if (subCategory.includes(e.target.value)) {
//       setSubCategory(prev => prev.filter(item => item !== e.target.value))
//     }
//     else {
//       setSubCategory(prev => [...prev, e.target.value])
//     }
//   }

//   const applyFilter = () => {

//     let productsCopy = products.slice();

//     if (showSearch && search) {
//       productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
//     }

//     if (category.length > 0) {
//       productsCopy = productsCopy.filter(item => category.includes(item.category));
//     }

//     if (subCategory.length > 0) {
//       productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
//     }

//     setFilterProducts(productsCopy)

//   }

//   const sortProduct = () => {

//     let fpCopy = filterProducts.slice();

//     switch (sortType) {
//       case 'low-high':
//         setFilterProducts(fpCopy.sort((a, b) => (a.price - b.price)));
//         break;

//       case 'high-low':
//         setFilterProducts(fpCopy.sort((a, b) => (b.price - a.price)));
//         break;

//       default:
//         applyFilter();
//         break;
//     }

//   }

//   useEffect(() => {
//     applyFilter();
//   }, [category, subCategory, search, showSearch, products])

//   useEffect(() => {
//     sortProduct();
//   }, [sortType])

//   return (
//     <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

//       {/* Filter Options */}
//       <div className='min-w-60'>
//         <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
//           <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
//         </p>
//         {/* Category Filter */}
//         <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
//           <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
//           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory} /> Men
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory} /> Women
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory} /> kids
//             </p>
//           </div>
//         </div>
//         {/* SubCategory Filter */}
//         <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
//           <p className='mb-3 text-sm font-medium'>TYPE</p>
//           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory} /> Topwear
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory} /> Bottomwear
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory} /> Winterwear
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side */}
//       <div className='flex-1'>

//         <div className='flex justify-between text-base sm:text-2xl mb-4'>
//           <Title text1={'ALL'} text2={'COLLECTIONS'} />
//           {/* Porduct Sort */}
//           <select onChange={(e) => setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
//             <option value="relavent">Sort by: Relavent</option>
//             <option value="low-high">Sort by: Low to High</option>
//             <option value="high-low">Sort by: High to Low</option>
//           </select>
//         </div>

//         {/* Map Products */}
//         <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
//           {
//             filterProducts.map((item, index) => (
//               <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
//             ))
//           }
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Collection



import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { toast } from 'react-toastify';
import api from '../api';

const Collection = () => {

  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');

  // ── AI Search State ──────────────────────────────────────────
  const [aiFilters, setAiFilters] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Toggle Handlers ──────────────────────────────────────────
  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  // ── Normal Filter (existing logic — untouched) ───────────────
  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    setFilterProducts(productsCopy)
  }

  // ── Sort ─────────────────────────────────────────────────────
  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => (a.price - b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => (b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }

  // ── AI Search Function ───────────────────────────────────────
  const fetchAISearch = async (query) => {
    setAiLoading(true);
    try {
      const res = await api.post("/api/product/ai-search", { q: query });

      if (res.data.success) {
        setFilterProducts(res.data.products);
        setAiFilters(res.data.filters);
      }

    } catch (error) {
      toast.error("AI search failed, showing regular results");
      setAiFilters(null);
      applyFilter(); // graceful fallback
    } finally {
      setAiLoading(false);
    }
  };

  // ── Debounce: wait 600ms after user stops typing ─────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 600);
    return () => clearTimeout(timer); // cleanup on each keystroke
  }, [search]);

  // ── Trigger AI search or fallback to normal filter ───────────
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length > 2) {
      // Long enough query → use AI
      fetchAISearch(debouncedSearch);
    } else {
      // Empty or too short → clear AI state, use normal filter
      setAiFilters(null);
      applyFilter();
    }
  }, [debouncedSearch]);

  // ── Normal filter triggers (category, subCategory etc.) ──────
  useEffect(() => {
    // Only run normal filter if AI is not active
    if (!debouncedSearch || debouncedSearch.trim().length <= 2) {
      applyFilter();
    }
  }, [category, subCategory, showSearch, products])

  useEffect(() => {
    sortProduct();
  }, [sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory} /> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory} /> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory} /> kids
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory} /> Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory} /> Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory} /> Winterwear
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product Sort */}
          <select onChange={(e) => setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
            <option value="relavent">Sort by: Relavent</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* ── AI Loading Indicator ── */}
        {aiLoading && (
          <div className='w-full text-center py-3 text-sm text-gray-400'>
            🔍 Searching with AI...
          </div>
        )}

        {/* ── AI Filter Pills ── shows what AI understood from query */}
        {aiFilters && !aiLoading && (
          <div className='w-full flex flex-wrap items-center gap-2 px-1 py-2 mb-4 border border-gray-100 rounded bg-gray-50'>
            <span className='text-xs text-gray-500 font-medium'>AI understood:</span>

            {aiFilters.category && (
              <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>
                {aiFilters.category}
              </span>
            )}
            {aiFilters.subCategory && (
              <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>
                {aiFilters.subCategory}
              </span>
            )}
            {aiFilters.maxPrice && (
              <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>
                Under ₹{aiFilters.maxPrice}
              </span>
            )}
            {aiFilters.keywords?.length > 0 && (
              <span className='bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full'>
                Keywords: {aiFilters.keywords.join(", ")}
              </span>
            )}
          </div>
        )}

        {/* ── No Results ── */}
        {!aiLoading && filterProducts.length === 0 && (
          <div className='w-full text-center py-10 text-sm text-gray-400'>
            No products found. Try a different search.
          </div>
        )}

        {/* ── Product Grid ── */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item, index) => (
            <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default Collection