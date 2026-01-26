import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  // 表單資料狀態（儲存登入表單輸入）
  const [formData, setFormData] = useState({
    username: "@gmail.com",
    password: "",
  });

  // 登入狀態管理（控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);

  // 產品資料狀態
  const [products, setProducts] = useState([]);

  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"

  //modal
  const productModalRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name);
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempProduct((preDate) => ({
      ...preDate,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/products`,
      );
      setProducts(response.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async (id) => {
    let url = `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/product`;
    let method = "put";
    if (modalType === "edit") {
      url = `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/product${id}/`;
      method = "put";
    }

    const productData = {
      data: {
        ...tempProduct,
        origin_price: Number(tempProduct.origin_price),
        price: Number(tempProduct.price),
        is_enabled: tempProduct.is_enabled ? 1 : 0,
        imagesUrl: [...tempProduct.imagesUrl.filter((url) => url !== "")],
      },
    };

    try {
      const response = await axios[method](url, productData);

      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  };

  const delProduct = async (id) => {
    try {
      const response = await axios.delete(
        `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/product/${id}`,
      );
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleModalImageChange = (index, value) => {
    setTempProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages[index] = value;

      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      // 清空輸入框時，移除最後的空白輸入框
      if (
        value === "" &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ""
      ) {
        newImages.pop();
      }

      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  const handleAddImage = () => {
    setTempProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.push("");
      return {
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  const handleRemoveImage = () => {
    setTempProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.pop();
      return {
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(
        `${VITE_API_BASE}/admin/signin`,
        formData,
      );
      const { token, expired } = response.data;

      // 設定 cookie
      document.cookie = `darumaToken=${token};expires=${new Date(expired)};`;
      // 設定 axios header
      axios.defaults.headers.common["Authorization"] = token;

      getProducts();
      // 設定登入成功狀態
      setIsAuth(true);
    } catch (error) {
      console.log(error.response);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("darumaToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }

    const checkLogin = async () => {
      try {
        // 讀取 Cookie
        const response = await axios.post(
          `${VITE_API_BASE}/api/user/check`,
          formData,
        );
        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.log(error.response?.data.message);
      }
    };

    checkLogin();

    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });
  }, []);

  const openModal = (type, product) => {
    setModalType(type);
    setTempProduct((pre) => ({
      ...pre,
      ...product,
    }));

    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <h2>week3</h2>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username" // 要跟 admin 一樣
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
              {/* 要跟 admin 一樣 */}
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password" // 要跟 admin 一樣
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label> {/* 要跟 admin 一樣 */}
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
            >
              建立新的產品
            </button>
          </div>
          <div className="row mt-5">
            <h2>產品列表</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>分類</th>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>編輯</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.category}</td>
                    <td>{product.title}</td>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td
                      className={`${product.is_enabled ? "text-success" : ""}`}
                    >
                      {product.is_enabled ? "啟用" : "未啟用"}
                    </td>
                    <td>
                      <div
                        className="btn-group"
                        role="group"
                        aria-label="Basic example"
                      >
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openModal("edit", product)}
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => openModal("delete", product)}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div
        className="modal fade"
        id="productModal"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div
              className={`modal-header bg-${modalType === "delete" ? "danger" : "dark"} text-white`}
            >
              <h5 id="productModalLabel" className="modal-title">
                <span>新增產品</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {modalType === "delete" ? (
                <p className="fs-4">
                  確定要刪除
                  <span className="text-danger">{tempProduct.title}</span>
                  嗎？
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={tempProduct.imageUrl}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      {tempProduct.imageUrl && (
                        <img
                          className="img-fluid"
                          src={tempProduct.imageUrl}
                          alt="主圖"
                        />
                      )}
                    </div>
                    <div>
                      {tempProduct.imagesUrl.map((url, index) => (
                        <div key={index}>
                          <label htmlFor="imageUrl" className="form-label">
                            輸入圖片網址
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`圖片網址${index + 1}`}
                            value={url}
                            onChange={(e) =>
                              handleModalImageChange(index, e.target.value)
                            }
                          />
                          {url && (
                            <img
                              className="img-fluid"
                              src={url}
                              alt={`副圖${index + 1}`}
                            />
                          )}
                        </div>
                      ))}
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[
                          tempProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm d-block w-100"
                            onClick={() => handleAddImage()}
                          >
                            新增圖片
                          </button>
                        )}
                    </div>
                    <div>
                      {tempProduct.imagesUrl.length >= 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm d-block w-100"
                          onClick={() => handleRemoveImage()}
                        >
                          刪除圖片
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={tempProduct.title}
                        onChange={(e) => handleModalInputChange(e)}
                        disabled={modalType === "edit"}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">
                          分類
                        </label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={tempProduct.category}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">
                          單位
                        </label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={tempProduct.unit}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">
                          原價
                        </label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={tempProduct.origin_price}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          售價
                        </label>
                        <input
                          name="price"
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={tempProduct.price}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        產品描述
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={tempProduct.description}
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        說明內容
                      </label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={tempProduct.content}
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={tempProduct.is_enabled}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="is_enabled"
                        >
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modalType === "delete" ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => delProduct(tempProduct.id)}
                >
                  刪除
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => closeModal()}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateProduct(tempProduct.id)}
                  >
                    確認
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
