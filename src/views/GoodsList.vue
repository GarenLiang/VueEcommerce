<template>
    <div>
      <nav-header></nav-header>
      <nav-bread>
        <span>Goods</span>
      </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a @click="sortGoods" href="javascript:void(0)" class="price">
              Price
              <!-- <svg class="icon-arrow-short" v-bind:class="{'sort-up':!sortFlag}">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short"></use>
              </svg> -->
              <img v-bind:class="{'sort-up':!sortFlag}" class="icon-arrow-short" src="static/up-arrow.png" width="11" height="11"/>
            </a>
            <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked=='all'}">All</a></dd>
                <dd v-for="(price,index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked==index}">{{price.startPrice}} - {{price.endPrice}}</a>
                </dd>

              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="(item,index) in goodsList">
                    <div class="pic">
                      <a href="#"><img v-bind:src="'/static/' + item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">

                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)"><img src="static/carrier2.png" width="16" height="16"/> &nbsp加入购物车</a>

                      </div>
                    </div>
                  </li>
                </ul>
                <div class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                  <img src="../../static/loading-svg/Pacman.svg" v-show="loading">
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
      <modal v-bind:mdShow='mdShow' v-on:close='closeModal'>

           <p slot="message">
               Please Login
           </p>
           <div slot="btnGroup">
               <a class="btn btn--m" href="javascript:;" @click="mdShow=false">Close</a>
           </div>
       </modal>
       <modal v-bind:mdShow='mdShowCart' v-on:close='mdShowCart=false'>

            <p slot="message">
                <img class="icon-status-ok" src="static/checked.png">
                <span>Successfully add item</span>
            </p>
            <div slot="btnGroup">
                <a class="btn btn--m" @click="mdShowCart=false">Continue to Buy</a>
                <router-link class="btn btn--m" href="javascript:;" to="/cart">Check Cart</router-link>
            </div>
        </modal>
      <nav-footer></nav-footer>
    </div>
</template>
<style>
  .list-wrap ul::after{
    clear: both;
    content: '';
    height: 0;
    display: block;
    visibility: hidden;
  }
  .load-more{
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .sort-up {
    transform:rotate(180deg);
    transition: all .3s ease-out;
  }

</style>
<script>
  import './../assets/css/base.css'
  import './../assets/css/product.css'
  import NavHeader from '@/components/NavHeader.vue'
  import NavFooter from '@/components/NavFooter.vue'
  import NavBread from '@/components/NavBread.vue'
  import Modal from '@/components/Modal.vue'
  import axios from 'axios'
  export default{
    data(){
      return{
        goodsList: [],
        sortFlag: true,
        page:1,
        pageSize:8,
        busy:true,
        loading:false,
        mdShow:false,
        mdShowCart:false,
        priceFilter:[
          {
            startPrice:'0.00',
            endPrice:'500.00'
          },
          {
            startPrice:'500.00',
            endPrice:'1000.00'
          },
          {
            startPrice:'1000.00',
            endPrice:'2000.00'
          }
        ],
        priceChecked:'all',
        filterBy:false,
        overLayFlag:false
      }
    },
    components:{
      NavHeader,
      NavFooter,
      NavBread,
      Modal,
    },
    mounted: function() {
      this.getGoodsList();
    },
    methods:{
      getGoodsList(flag){
        var param = {
          page:this.page,
          pageSize:this.pageSize,
          sort:this.sortFlag?1:-1,
          priceLevel:this.priceChecked
        }
        this.loading = true;
        axios.get("/goods/list",{
          params:param
        }).then((response)=> {
          let res = response.data;
          this.loading = true;
          if(res.status=="0") {
            if(flag){
              this.goodsList = this.goodsList.concat(res.result.list);
              if(res.result.count==0){
                this.busy = true;
              }else{
                this.busy = false;
              }
            } else {
            this.goodsList = res.result.list;
            this.busy = false;
          }
          }else {
            this.goodsList = [];
          }
        });
      },
      sortGoods() {
          this.sortFlag = !this.sortFlag;
          this.page = 1;
          this.getGoodsList();
        },
      loadMore(){
          this.busy = true;
          setTimeout(() => {
            this.page++;
            this.getGoodsList(true);
          }, 1000);
        },
        addCart(productId){
           axios.post('/goods/addCart',{
               productId:productId
           }).then((res)=>{
               if(res.data.status=='0'){
                   this.mdShowCart = true;
               }else{
                 this.mdShow = true;
               }
           })
       },
      showFilterPop(){
        this.filterBy = true;
        this.overLayFlag = true;
      },
      setPriceFilter(index) {
        this.priceChecked = index;
        // this.closePop();
        this.page = 1;
        this.getGoodsList();
      },
      closePop(){
        this.filterBy = false;
        this.overLayFlag = false;
      },
      closeModal(){
        this.mdShow = false;
      },
    }
  }
</script>
