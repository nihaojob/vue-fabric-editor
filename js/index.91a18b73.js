var C=(m,r,c)=>new Promise((g,n)=>{var y=l=>{try{s(c.next(l))}catch(f){n(f)}},p=l=>{try{s(c.throw(l))}catch(f){n(f)}},s=l=>l.done?g(l.value):Promise.resolve(l.value).then(y,p);s((c=c.apply(m,r)).next())});import{_ as L,h as B,r as x,B as i,C as u,J as v,H as o,E as d,K as S,L as I,u as a,D as z,F as _,M as O,p as K,Y as T,a7 as Y,y as $,I as w,G as A,T as k,i as Q,O as X,P as Z}from"./index.d52eceee.js";import{a7 as ee,W as D,$ as te,a8 as ae,a9 as oe,a0 as se,a4 as ne,a5 as le,a6 as ie}from"./usePageList.e15cede2.js";const re={class:"banner"},ce=["href"],de=["src","alt"],pe=O({name:"Banner"}),ue=Object.assign(pe,{setup(m){const r=B({autoplay:!1,autoplaySpeed:2e3,dots:"inside",radiusDot:!1,trigger:"click",arrow:"hover"}),c=x([]);return ee(D.stringify({populate:{img:"*"}})).then(g=>{c.value=g.data.data.map(n=>({id:n.id,title:n.attributes.title,img:te(n.attributes.img),url:n.attributes.url}))}),(g,n)=>{const y=i("CarouselItem"),p=i("Carousel");return u(),v("div",re,[o(p,{modelValue:g.value,"onUpdate:modelValue":n[0]||(n[0]=s=>g.value=s),height:250,autoplay:a(r).autoplay,"autoplay-speed":a(r).autoplaySpeed,dots:a(r).dots,"radius-dot":a(r).radiusDot,trigger:a(r).trigger,arrow:a(r).arrow},{default:d(()=>[(u(!0),v(S,null,I(a(c),s=>(u(),z(y,{class:"img-box",key:s.id},{default:d(()=>[_("a",{href:s.url,target:"_blank"},[_("img",{src:s.img,alt:s.title},null,8,de)],8,ce)]),_:2},1024))),128))]),_:1},8,["modelValue","autoplay","autoplay-speed","dots","radius-dot","trigger","arrow"])])}}}),_e=L(ue,[["__scopeId","data-v-ac210245"]]);const me=m=>(X("data-v-1279a3f7"),m=m(),Z(),m),ge={class:"home"},fe={class:"left"},ve={class:"right"},ye=me(()=>_("a",{href:"https://github.com/nihaojob/vue-fabric-editor",target:"_blank"},[_("img",{src:"https://camo.githubusercontent.com/f440bed74efe64ce92599748090837ec92cc33ead4bf29d115d9745af1415c19/68747470733a2f2f62616467656e2e6e65742f6769746875622f73746172732f6e6968616f6a6f622f7675652d6661627269632d656469746f72",alt:"vue-fbric-editor"})],-1)),he={class:"search-box"},be={class:"img-box grid",id:"imgBox","transition-duration":"0.3s",gutter:10,"item-selector":".grid-item"},xe=["src","alt","onClick"],we=O({name:"Home"}),Ce=Object.assign(we,{setup(m){const r=K(),c=x([]);(()=>C(this,null,function*(){const h=yield ae();c.value=h.data.data.map(e=>({id:e.id,name:e.attributes.name}))}))();const n=x([]),y=x(0),p=x(1),s=x(20),l=B({name:{$containsi:""},templ_type:{$in:[]}}),f=()=>C(this,null,function*(){const h={populate:{img:"*"},filters:Y(l),fields:["name"],pagination:{page:p.value,pageSize:s.value}};$.Spin.show();try{const e=yield oe(D.stringify(h));y.value=e.data.meta.pagination.total,n.value=e.data.data.map(b=>({id:b.id,name:b.attributes.name,src:se(b.attributes.img)}))}catch(e){console.log(e)}$.Spin.hide()}),V=()=>{p.value=1,f()};f();const H=h=>{const e=r.resolve({path:"/",query:{tempId:h.id}});console.log(e,1111),window.open(e.href,"_blank")};return(h,e)=>{const b=i("Divider"),P=i("Button"),U=i("Header"),F=i("Input"),j=i("TagSelectOption"),E=i("TagSelect"),M=i("Tooltip"),N=i("Page"),R=i("Content"),q=i("Footer"),W=i("Layout"),G=T("masonry-tile"),J=T("masonry");return u(),v("div",ge,[o(W,null,{default:d(()=>[o(U,{style:{position:"fixed",width:"100%",zIndex:99}},{default:d(()=>[_("div",fe,[o(ne),o(b,{type:"vertical"}),w(" 在线设计工具 ")]),_("div",ve,[o(P,{type:"primary",to:"/",size:"smail",target:"_blank"},{default:d(()=>[w("新建设计")]),_:1}),o(b,{type:"vertical"}),ye,o(a(le)),o(ie)])]),_:1}),o(R,{style:{margin:"40px 20px 0",minHeight:"500px",minWidth:"1200px"}},{default:d(()=>[o(_e),_("div",he,[o(F,{size:"large",class:"search-input",clearable:"",search:"",modelValue:a(l).name.$containsi,"onUpdate:modelValue":e[0]||(e[0]=t=>a(l).name.$containsi=t),"enter-button":"",placeholder:"请输入关键词",onOnSearch:V},null,8,["modelValue"]),o(E,{modelValue:a(l).templ_type.$in,"onUpdate:modelValue":e[1]||(e[1]=t=>a(l).templ_type.$in=t),onOnChange:V},{default:d(()=>[(u(!0),v(S,null,I(a(c),t=>(u(),z(j,{name:t.id,key:t.id},{default:d(()=>[w(A(t.name),1)]),_:2},1032,["name"]))),128))]),_:1},8,["modelValue"])]),k((u(),v("div",be,[(u(!0),v(S,null,I(a(n),t=>k((u(),v("div",{class:"img-item grid-item",key:t.id},[o(M,{content:t.name,placement:"top"},{default:d(()=>[_("img",{src:t.src,alt:t.name,onClick:Se=>H(t)},null,8,xe)]),_:2},1032,["content"])])),[[G]])),128))])),[[J]]),o(N,{class:"page",total:a(y),modelValue:a(p),"onUpdate:modelValue":e[2]||(e[2]=t=>Q(p)?p.value=t:null),onOnChange:f,onOnPageSizeChange:e[3]||(e[3]=t=>s.value=t),"page-size":a(s),"show-sizer":""},null,8,["total","modelValue","page-size"])]),_:1}),o(q,{class:"layout-footer-center"},{default:d(()=>[w(" 2024 © 北京迅单科技有限公司 京ICP备2022034407号-2 ")]),_:1})]),_:1})])}}}),$e=L(Ce,[["__scopeId","data-v-1279a3f7"]]);export{$e as default};
