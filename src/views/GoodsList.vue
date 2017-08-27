<template>
  <div>
    Goods List
    <span>{{$route.params.goodsId}}</span><br>
    <span>{{$route.params.name}}</span>
    <router-link to="/goods/title">Show Goods Title</router-link>
    <router-link to="/goods/img">Show Goods Image</router-link>
    <div>
      <router-view></router-view>
    </div>
    <router-link v-bind:to="{name: 'cart', params:{cartId:123}}">Link to Cart Page</router-link>
  </div>
</template>
<style>

</style>
<script>
  export default{
    data(){
      return{
        msg: 'hello vue'
      }
    },
    methods:{
      jump(){
        this.$router.push({path: '/cart?goodsId=123'});
      }
    }
  }
</script>
