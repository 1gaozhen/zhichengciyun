console.log("智承瓷韵 系统启动 ✅");

// 纹样数据
const patternData = [
    {
        name:"青花缠枝牡丹纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"牡丹象征花开富贵、圆满昌盛。",
        mainImg:"images/pattern_07_peony.jpg"
    },
    {
        name:"青花缠枝团花纹样",
        dynasty:"清代",
        type:"花卉纹样",
        desc:"圆形对称团花构图，寓意团圆美满。",
        mainImg:"images/pattern_10_tuanhua.jpg"
    },
    {
        name:"青花繁复缠枝花纹",
        dynasty:"清代",
        type:"花卉纹样",
        desc:"层次丰富、生机盎然。",
        mainImg:"images/pattern_02_complex.jpg"
    },
    {
        name:"青花凤凰纹样",
        dynasty:"明清通用",
        type:"瑞兽纹样",
        desc:"凤凰高贵吉祥。",
        mainImg:"images/pattern_08_phoenix.jpg"
    },
    {
        name:"青花福禄平安多子纹",
        dynasty:"清代",
        type:"吉祥纹样",
        desc:"承载平安兴旺祈愿。",
        mainImg:"images/pattern_11_fupeace.jpg"
    },
    {
        name:"青花菊花纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"高洁清雅、长寿安康。",
        mainImg:"images/pattern_01_chrysanthemum.jpg"
    },
    {
        name:"青花龙纹纹样",
        dynasty:"明清通用",
        type:"瑞兽纹样",
        desc:"龙腾四海、运势昌盛。",
        mainImg:"images/pattern_03_dragon.jpg"
    },
    {
        name:"青花葡萄纹",
        dynasty:"明代",
        type:"果蔬纹样",
        desc:"多子多福、家业兴旺。",
        mainImg:"images/pattern_06_grape.jpg"
    },
    {
        name:"青花折枝小花纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"清雅秀气，东方审美。",
        mainImg:"images/pattern_09_smallflower.jpg"
    },
    {
        name:"青花瑞兽纹",
        dynasty:"明代",
        type:"瑞兽纹样",
        desc:"镇宅纳祥、守护平安。",
        mainImg:"images/pattern_14_beast.jpg"
    },
    {
        name:"青花人物圆瓷纹样",
        dynasty:"清代",
        type:"人物纹样",
        desc:"人文底蕴深厚。",
        mainImg:"images/pattern_13_character.jpg"
    },
    {
        name:"青花寿字吉祥团纹",
        dynasty:"清代",
        type:"吉祥纹样",
        desc:"福寿双全、阖家吉祥。",
        mainImg:"images/pattern_15_shouluck.jpg"
    },
    {
        name:"青花童子吉祥纹",
        dynasty:"明代",
        type:"吉祥纹样",
        desc:"天真喜乐、家族兴旺。",
        mainImg:"images/pattern_16_childluck.jpg"
    },
    {
        name:"青花圆盘中心纹",
        dynasty:"明清通用",
        type:"器物纹样",
        desc:"规整典雅，适配瓷盘。",
        mainImg:"images/pattern_17_circle.jpg"
    },
    {
        name:"青花八宝吉祥纹",
        dynasty:"清代",
        type:"吉祥纹样",
        desc:"汇聚八方福气。",
        mainImg:"images/pattern_12_dragonluck.jpg"
    },
    {
        name:"青花缠枝大花纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"花开繁盛、生生不息。",
        mainImg:"images/pattern_04_flower.jpg"
    }
];

// 公共工具
function getPatternStats(id) {
    return {
        like: Number(localStorage.getItem(`like_${id}`)) || 0,
        view: Number(localStorage.getItem(`view_${id}`)) || 0,
        comment: JSON.parse(localStorage.getItem(`comment_${id}`) || '[]')
    }
}

// 访客统计
function getTodayStr(){
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function getGuestId(){
    let id = localStorage.getItem("guest_id");
    if(!id){
        id = "guest_" + Math.random().toString(36).slice(2);
        localStorage.setItem("guest_id", id);
    }
    return id;
}
function recordVisitor(){
    const gid = getGuestId();
    const today = getTodayStr();
    let total = Number(localStorage.getItem("visitor_total")) || 0;
    let list = JSON.parse(localStorage.getItem("visitor_list") || "[]");
    if(!list.includes(gid)){
        list.push(gid);
        localStorage.setItem("visitor_list",JSON.stringify(list));
        total++;
        localStorage.setItem("visitor_total",total);
    }
    localStorage.setItem("visitor_today",today);
    localStorage.setItem("visitor_today_num",Number(localStorage.getItem("visitor_today_num"))||1);
}
function getVisitorData(){
    return {
        total:localStorage.getItem("visitor_total")||0,
        today:localStorage.getItem("visitor_today_num")||0
    }
}
recordVisitor();

// 首页渲染
if(location.href.includes("index")){
    window.onload = function(){
        let hotList = patternData.map((item,idx)=>{
            let s = getPatternStats(idx);
            return {...item,id:idx,score:s.like*3 + s.view};
        }).sort((a,b)=>b.score-a.score).slice(0,10);

        let html = "";
        for(let i=0;i<2;i++){
            hotList.forEach(item=>{
                let s = getPatternStats(item.id);
                html += 
                `<a href="detail.html?id=${item.id}" class="hot-pattern-card">
                    <img src="${item.mainImg}" class="hot-card-img" alt="${item.name}" loading="eager">
                    <div class="hot-card-info">
                        <div class="hot-card-name">${item.name}</div>
                        <div class="hot-card-data">❤️${s.like} 👁${s.view}</div>
                    </div>
                </a>`;
            })
        }
        document.getElementById("hotScrollList").innerHTML = html;

        let v = getVisitorData();
        let vHtml = `<div style="text-align:center;padding:10px;color:#965a20;font-weight:bold;">👥今日访客：${v.today} 人 &nbsp; 🌐全站累计访问：${v.total} 次</div>`;
        document.querySelector(".header").insertAdjacentHTML("afterend",vHtml);
        refreshUI();
    }
}

// 纹样库
if(location.href.includes("pattern")){
    window.onload = function(){
        let v = getVisitorData();
        let vHtml = `<div style="text-align:center;padding:8px 0;color:#965a20;">👥今日访客：${v.today} 人 &nbsp; 🌐总访问：${v.total} 次</div>`;
        document.querySelector(".top-search-bar").insertAdjacentHTML("beforebegin",vHtml);
        refreshUI();
    }
}

// 详情页
if(location.href.includes("detail")){
    window.onload = function(){
        const params = new URLSearchParams(location.search);
        const pid = params.get("id");
        if(!pid||!patternData[pid])location.href="pattern.html";
        const data = patternData[pid];
        const stats = getPatternStats(pid);

        stats.view++;
        localStorage.setItem(`view_${pid}`,stats.view);

        document.getElementById('dName').innerText = data.name;
        document.getElementById('dDynasty').innerText = `朝代：${data.dynasty}`;
        document.getElementById('dDesc').innerText = data.desc;
        document.getElementById('dMainImg').src = data.mainImg;
        document.getElementById('likeCount').innerText = stats.like;
        document.getElementById('viewCount').innerText = stats.view;

        let likeFlag = localStorage.getItem(`isLiked_${pid}`)==="1";
        let likeBtn = document.getElementById("likeBtn");
        if(likeFlag)likeBtn.classList.add("liked");

        likeBtn.onclick = function(){
            if(this.classList.contains("liked")){
                this.classList.remove("liked");
                stats.like--;
                localStorage.setItem(`like_${pid}`,0);
                localStorage.setItem(`isLiked_${pid}`,"0");
            }else{
                this.classList.add("liked");
                stats.like++;
                localStorage.setItem(`like_${pid}`,stats.like);
                localStorage.setItem(`isLiked_${pid}`,"1");
            }
            document.getElementById("likeCount").innerText = stats.like;
        };

        function renderComment(){
            let box = document.getElementById("commentList");
            box.innerHTML = "";
            stats.comment.forEach((item,idx)=>{
                box.innerHTML += 
                `<div class="comment-item">
                    <div>
                        <span>${item.time}</span>
                        <p>${item.content}</p>
                    </div>
                    <button class="del-btn" onclick="delCmt(${idx})">删除</button>
                </div>`;
            })
        }
        window.delCmt = function(idx){
            if(!confirm("确定删除？"))return;
            stats.comment.splice(idx,1);
            localStorage.setItem(`comment_${pid}`,JSON.stringify(stats.comment));
            renderComment();
        }

        document.getElementById("submitComment").onclick = function(){
            let val = document.getElementById("commentInput").value.trim();
            if(!val){alert("请输入留言");return;}
            stats.comment.unshift({
                content:val,
                time:new Date().toLocaleString()
            });
            localStorage.setItem(`comment_${pid}`,JSON.stringify(stats.comment));
            document.getElementById("commentInput").value = "";
            renderComment();
        }
        renderComment();

        let v = getVisitorData();
        let vTip = `<div style="background:#fff;padding:10px;border-radius:8px;margin:15px 0;text-align:center;color:#666;">👥今日访客：${v.today} &nbsp; 全站累计：${v.total}</div>`;
        document.querySelector(".info-card").insertAdjacentHTML("afterend",vTip);
        refreshUI();
    }
}

// ========== 全局数据储存工具 ==========
const Storage = {
  set(key,val){
    localStorage.setItem(key, JSON.stringify(val));
  },
  get(key){
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
};

// ========== 管理员配置 ==========
const ADMIN_USERNAME = "gaozhen";

// 获取所有用户
function getAllUsers() {
    return Storage.get("allUsers") || [];
}
// 检查用户名是否存在
function isUsernameExists(username) {
    return getAllUsers().some(u => u.user === username);
}
// 注册用户
function registerUser(username, pwd) {
    if(isUsernameExists(username)) return false;
    let users = getAllUsers();
    users.push({ user:username, pwd:pwd });
    Storage.set("allUsers", users);
    return true;
}
// 登录
function loginUser(username, pwd) {
    let users = getAllUsers();
    let u = users.find(x => x.user === username && x.pwd === pwd);
    if(u){
        setLoginUser(username);
        return true;
    }
    return false;
}
// 登录状态（兼容手机）
function getLoginUser(){
    let user = localStorage.getItem("loginUser");
    if (!user) user = sessionStorage.getItem("loginUser");
    if (!user) {
        const match = document.cookie.match(/loginUser=([^;]+)/);
        user = match ? decodeURIComponent(match[1]) : "";
    }
    return user || "";
}
function setLoginUser(user) {
    localStorage.setItem("loginUser", user);
    sessionStorage.setItem("loginUser", user);
    document.cookie = "loginUser=" + encodeURIComponent(user) + "; path=/; SameSite=Lax;";
}
function clearLoginUser() {
    localStorage.removeItem("loginUser");
    sessionStorage.removeItem("loginUser");
    document.cookie = "loginUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
}
// 是否管理员
function isAdmin() {
    return getLoginUser() === ADMIN_USERNAME;
}

// 登录/注册 UI 刷新
function refreshUI(){
    const user = getLoginUser();
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const userCenterBtn = document.getElementById("userCenterBtn");
    const adminBtn = document.getElementById("adminBtn");
    
    if(!loginBtn || !registerBtn || !userCenterBtn) return;

    if(user){
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";
        userCenterBtn.style.display = "inline";
        userCenterBtn.innerText = user;
        if(adminBtn){
            adminBtn.style.display = isAdmin() ? "inline" : "none";
        }
    }else{
        loginBtn.style.display = "inline";
        registerBtn.style.display = "inline";
        userCenterBtn.style.display = "none";
        if(adminBtn) adminBtn.style.display = "none";
    }
}

// 对外暴露登录注册方法
window.userLogin = function(){
    let u = prompt("用户名：");
    let p = prompt("密码：");
    if(!u || !p) return;
    if(loginUser(u,p)){
        refreshUI();
        alert("登录成功");
    }else{
        alert("账号或密码错误");
    }
}

window.userRegister = function(){
    let u = prompt("设置用户名：");
    let p = prompt("设置密码：");
    if(!u || !p) return;
    if(registerUser(u,p)){
        alert("注册成功！请登录");
    }else{
        alert("用户名已存在");
    }
}

// 1.浏览历史记录
function addBrowseHistory(name){
  let user = getLoginUser();
  if(!user) return;
  let list = Storage.get("browse_"+user) || [];
  list.unshift({
    title:name,
    time:new Date().toLocaleString()
  });
  if(list.length>30) list.length=30;
  Storage.set("browse_"+user,list);
}

// 2.点赞
function addLike(name){
  let user = getLoginUser();
  if(!user) return;
  let list = Storage.get("like_"+user) || [];
  if(!list.includes(name)){
    list.push(name);
    Storage.set("like_"+user,list);
  }
}

// 3.收藏
function addCollect(name){
  let user = getLoginUser();
  if(!user) return;
  let list = Storage.get("collect_"+user) || [];
  if(!list.includes(name)){
    list.push(name);
    Storage.set("collect_"+user,list);
  }
}

// 4.全局留言
function saveMessage(content){
  let user = getLoginUser();
  if(!user){
    alert("请先登录后再留言！");
    return false;
  }
  let msgList = Storage.get("global_message") || [];
  msgList.unshift({
    username:user,
    content:content,
    time:new Date().toLocaleString()
  });
  Storage.set("global_message",msgList);
  return true;
}

// 获取全部留言
function getAllMessage(){
  return Storage.get("global_message") || [];
}

// 删除自己留言
function delMessage(index){
  let user = getLoginUser();
  let list = getAllMessage();
  if(list[index].username === user || isAdmin()){
    list.splice(index,1);
    Storage.set("global_message",list);
    location.reload();
  }else{
    alert("只能删除自己的留言");
  }
}