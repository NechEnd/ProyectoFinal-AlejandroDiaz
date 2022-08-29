document.addEventListener("DOMContentLoaded", (e) => {
  fetchData();
  //LocalStorage
  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
    pintarCarrito();
  }
});

//TRAER PRODUCTOS - FETCH
const fetchData = async () => {
  try {
    const res = await fetch("api.json");
    const data = await res.json();
    pintarProductos(data);
    detectarBotones(data);
  } catch (error) {
    console.log(error);
  }
};

//PINTAR PRODUCTOS Y BUSCADOR
const contendorProductos = document.querySelector("#contenedor-productos");
const inputBuscar = document.querySelector("#search");
const filtro = document.querySelectorAll(".card");
const pintarProductos = (data) => {
  const template = document.querySelector("#template-productos").content;
  const fragment = document.createDocumentFragment();

  data.forEach((producto) => {
    template.querySelector("img").setAttribute("src", producto.thumbnailUrl);
    template.querySelector("h5").textContent = producto.title;
    template.querySelector("p span").textContent = producto.precio;
    template.querySelector("button").dataset.id = producto.id;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });
  contendorProductos.appendChild(fragment);
  // -------------------------Buscador------------------------
  function buscador() {
    const filtro = document.querySelectorAll(".card");
    inputBuscar.addEventListener("keyup", (e) => {
      let texto = e.target.value;
      let expReg = new RegExp(texto, "i");
      for (let i = 0; i < filtro.length; i++) {
        let valor = filtro[i];
        expReg.test(valor.innerText)
          ? valor.classList.remove("ocultar")
          : valor.classList.add("ocultar");
      }
    });
  }
  buscador();
};

let carrito = {};

const detectarBotones = (data) => {
  const botones = document.querySelectorAll(".card button");

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      //TOASTIFY
      Toastify({
        text: "Agregaste un producto al carrito",
        duration: 3000,
      }).showToast();
      //FIN DE TOASTIFY
      const producto = data.find(
        (item) => item.id === parseInt(btn.dataset.id)
      );
      producto.cantidad = 1;
      if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
      }
      carrito[producto.id] = { ...producto };
      pintarCarrito();
    });
  });
};

const items = document.querySelector("#items");

const pintarCarrito = () => {
  //pendiente innerHTML
  items.innerHTML = "";

  const template = document.querySelector("#template-carrito").content;
  const fragment = document.createDocumentFragment();

  Object.values(carrito).forEach((producto) => {
    template.querySelector("th").textContent = producto.id;
    template.querySelectorAll("td")[0].textContent = producto.title;
    template.querySelectorAll("td")[1].textContent = producto.cantidad;
    template.querySelector("span").textContent =
      producto.precio * producto.cantidad;

    //botones
    template.querySelector(".btn-info").dataset.id = producto.id;
    template.querySelector(".btn-danger").dataset.id = producto.id;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });

  items.appendChild(fragment);

  pintarFooter();
  accionBotones();
  //LocalStorage
  localStorage.setItem("carrito", JSON.stringify(carrito));
};

const footer = document.querySelector("#footer-carrito");
const pintarFooter = () => {
  footer.innerHTML = "";

  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío </th>
        `;
    return;
  }

  const template = document.querySelector("#template-footer").content;
  const fragment = document.createDocumentFragment();

  // sumar cantidad y sumar totales
  const nCantidad = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const nPrecio = Object.values(carrito).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );

  template.querySelectorAll("td")[0].textContent = nCantidad;
  template.querySelector("span").textContent = nPrecio;

  const clone = template.cloneNode(true);
  fragment.appendChild(clone);

  footer.appendChild(fragment);

  const boton = document.querySelector("#vaciar-carrito");
  boton.addEventListener("click", () => {
    //PROMISE y sweetalert
    swal({
      title: "Estas seguro que deseas vaciar el carrito?",
      text: "Una vez eliminado, no podrás recuperarlo!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("Has vaciado tu carrito!", {
          icon: "success",
        });
        carrito = {};
        pintarCarrito();
      } else {
        swal("No se han hecho cambios");
      }
    });
  });

  const boton2 = document.querySelector("#comprar-carrito");
  boton2.addEventListener("click", (e) => {
    //PROMISE y sweetalert
    swal({
      title: "Estas seguro que deseas confirmar la compra?",
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("Has confirmado tu compra", {
          text: "Gracias por su compra, pronto recibira su pedido.",
          icon: "success",
        });
        carrito = {};
        pintarCarrito();
      } else {
        swal("No se han hecho cambios");
      }
    });
  });
};

const accionBotones = () => {
  const botonesAgregar = document.querySelectorAll("#items .btn-info");
  const botonesEliminar = document.querySelectorAll("#items .btn-danger");

  botonesAgregar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const producto = carrito[btn.dataset.id];
      producto.cantidad++;
      carrito[btn.dataset.id] = { ...producto };
      pintarCarrito();
    });
  });

  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const producto = carrito[btn.dataset.id];
      producto.cantidad--;
      if (producto.cantidad === 0) {
        delete carrito[btn.dataset.id];
      } else {
        carrito[btn.dataset.id] = { ...producto };
      }
      pintarCarrito();
    });
  });
};
