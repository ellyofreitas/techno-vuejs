const vm = new Vue({
  el: '#app',
  data: {
    products: [],
    product: null,
    cart: [],
    alertMessage: 'Item adicionado ao carrinho!',
    alertActive: false,
    cartActive: false,
  },
  filters: {
    toMoney(value) {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
  computed: {
    cartTotal() {
      return this.cart.reduce((total, item) => item.preco + total, 0);
    },
  },
  methods: {
    async fetchProducts() {
      const data = await fetch('./api/produtos.json').then(data => data.json());
      this.products = data;
    },
    async fetchProduct(id) {
      try {
        const data = await fetch(`./api/produtos/${id}/dados.json`).then(data =>
          data.json()
        );
        this.product = data;
      } catch (error) {
        this.alert('Produto não disponivel');
      }
    },
    openModal(id) {
      this.fetchProduct(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    closeModal({ target, currentTarget }) {
      if (target === currentTarget) {
        this.product = null;
      }
    },
    closeCart({ target, currentTarget }) {
      if (target === currentTarget) {
        this.cartActive = null;
      }
    },
    addItem() {
      this.product.estoque--;
      const { id, nome, preco } = this.product;
      this.cart.push({ id, nome, preco });
      this.alert(`${nome} adicionado ao carrinho`);
    },
    removeItem(index) {
      this.cart.splice(index, 1);
      this.alert('Item removido do carrinho');
    },
    checkLocalStorage() {
      if (window.localStorage.technocart) {
        this.cart = JSON.parse(window.localStorage.technocart);
      }
    },
    compareStock() {
      const { length } = this.cart.filter(({ id }) => id === this.product.id);
      this.product.estoque -= length;
    },
    checkout() {
      this.cart = [];
      this.cartActive = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.alert('Compra finalizada!');
    },
    alert(message) {
      (this.alertMessage = message), (this.alertActive = true);
      setTimeout(() => {
        this.alertActive = false;
      }, 1500);
    },
    router() {
      const hash = document.location.hash;
      if (hash) {
        this.fetchProduct(hash.replace('#', ''));
      }
    },
  },
  watch: {
    product() {
      document.title = (this.product && this.product.nome) || 'Techno';
      const hash = (this.product && this.product.id) || '';
      history.pushState(null, null, `#${hash}`);

      if (this.product) {
        this.compareStock();
      }
    },
    cart() {
      window.localStorage.technocart = JSON.stringify(this.cart);
    },
  },
  created() {
    this.fetchProducts();
    this.router();
    this.checkLocalStorage();
  },
});
