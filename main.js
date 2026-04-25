console.log("智承瓷韵 系统启动 ✅");

// 全局纹样完整数据库
const patternData = [
    {
        name:"青花缠枝牡丹纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"牡丹象征花开富贵、圆满昌盛，缠枝连绵不绝，寓意家族繁荣长久、吉祥美满，是中式青花经典百搭纹样。",
        mainImg:"images/青花缠枝牡丹纹.jpg"
    },
    {
        name:"青花缠枝团花纹样",
        dynasty:"清代",
        type:"花卉纹样",
        desc:"圆形对称团花构图，纹样精致繁复，寓意团圆美满、富贵安康，多用于高端瓷盘主体装饰。",
        mainImg:"images/青花缠枝团花纹样.jpg"
    },
    {
        name:"青花繁复缠枝花纹",
        dynasty:"清代",
        type:"花卉纹样",
        desc:"满铺缠绕式花卉纹样，层次丰富、生机盎然，象征福运绵延、世代繁盛不衰。",
        mainImg:"images/青花繁复缠枝花纹.jpg"
    },
    {
        name:"青花凤凰纹样",
        dynasty:"明清通用",
        type:"瑞兽纹样",
        desc:"凤凰为百鸟祥瑞之首，象征高贵吉祥、和谐美满，是传统青花顶级尊贵装饰纹样。",
        mainImg:"images/青花凤凰纹样.jpg"
    },
    {
        name:"青花福禄平安多子纹",
        dynasty:"清代",
        type:"吉祥纹样",
        desc:"瓷瓶寓意平安、灵鹿代表福禄、石榴象征多子多福，承载古人对人生顺遂、兴旺发达的美好祈愿。",
        mainImg:"images/青花福禄平安多子纹.jpg"
    },
    {
        name:"青花菊花纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"菊花象征高洁清雅、长寿安康，青花配色淡然雅致，自带古典文人风骨。",
        mainImg:"images/青花菊花纹.jpg"
    },
    {
        name:"青花龙纹纹样",
        dynasty:"明清通用",
        type:"瑞兽纹样",
        desc:"龙为皇权与权威象征，寓意龙腾四海、运势昌盛、尊贵不凡，青花瓷中等级最高的纹样。",
        mainImg:"images/青花龙纹纹样.jpg"
    },
    {
        name:"青花葡萄纹",
        dynasty:"明代",
        type:"果蔬纹样",
        desc:"葡萄果实累累、藤蔓绵延，寓意多子多福、硕果满满、家业兴旺丰收。",
        mainImg:"images/青花葡萄纹.jpg"
    },
    {
        name:"青花折枝小花纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"简约灵动折枝小花，清雅秀气，尽显淡泊雅致的东方古典审美。",
        mainImg:"images/青花折枝小花纹.jpg"
    },
    {
        name:"青花瑞兽纹",
        dynasty:"明代",
        type:"瑞兽纹样",
        desc:"传统护宅瑞兽纹样，镇宅纳祥、驱邪避凶，守护平安顺遂，造型古朴大气。",
        mainImg:"images/青花瑞兽纹.jpg"
    },
    {
        name:"青花人物圆瓷纹样",
        dynasty:"清代",
        type:"人物纹样",
        desc:"圆形构图青花人物故事，意境悠远、画工生动，承载深厚人文底蕴。",
        mainImg:"images/青花人物圆瓷纹样.jpg"
    },
    {
        name:"青花寿字吉祥团纹",
        dynasty:"清代",
        type:"吉祥纹样",
        desc:"中心寿字搭配环绕缠枝，主打福寿双全、健康长寿、阖家吉祥。",
        mainImg:"images/青花寿字吉祥团纹.jpg"
    },
    {
        name:"青花童子吉祥纹",
        dynasty:"明代",
        type:"吉祥纹样",
        desc:"活泼童子纹样，寓意天真喜乐、多子多福、家族兴旺绵延。",
        mainImg:"images/青花童子吉祥纹.jpg"
    },
    {
        name:"青花圆盘中心纹",
        dynasty:"明清通用",
        type:"器物纹样",
        desc:"专为瓷盘设计的中心装饰纹样，对称规整、精致典雅，适配各类圆形瓷器。",
        mainImg:"images/青花圆盘中心纹.jpg"
    },
    {
        name:"青花龙青花八宝吉祥纹",
        dynasty:"清代",
        type:"吉祥纹样",
        desc:"传统八宝吉祥组合纹样，汇聚八方福气，寓意万事如意、平安纳福。",
        mainImg:"images/青花龙青花八宝吉祥纹.jpg"
    },
    {
        name:"青花缠枝大花纹",
        dynasty:"明代",
        type:"花卉纹样",
        desc:"饱满大气缠枝大花，花开繁盛，寓意荣华富贵、生生不息。",
        mainImg:"images/青花缠枝大花纹.jpg"
    }
];

// 公共工具函数
function getPatternStats(id) {
    return {
        like: Number(localStorage.getItem(`like_${id}`)) || 0,
        view: Number(localStorage.getItem(`view_${id}`)) || 0,
        comment: JSON.parse(localStorage.getItem(`comment_${id}`) || '[]')
    }
}

// 访客系统 支持多设备访问
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
    let todayDay = localStorage.getItem("visitor_today") || "";
    let todayNum = Number(localStorage.getItem("visitor_today_num")) || 0;
    let list = JSON.parse(localStorage.getItem("visitor_list") || "[]");

    if(!list.includes(gid)){
        list.push(gid);
        localStorage.setItem("visitor_list",JSON.stringify(list));
        total++;
        localStorage.setItem("visitor_total",total);
    }
    if(todayDay !== today){
        localStorage.setItem("visitor_today",today);
        todayNum = 1;
    }else{
        if(!sessionStorage.getItem("today_in")){
            todayNum++;
            sessionStorage.setItem("today_in","1");
        }
    }
    localStorage.setItem("visitor_today_num",todayNum);
}
function getVisitorData(){
    return{
        total:localStorage.getItem("visitor_total")||0,
        today:localStorage.getItem("visitor_today_num")||0
    }
}
recordVisitor();

// 首页热门
if(location.href.includes("index")){
    document.addEventListener('DOMContentLoaded',()=>{
        let hotList = patternData.map((item,idx)=>{
            let s = getPatternStats(idx);
            return {...item,id:idx,score:s.like*3 + s.view + s.comment.length*5};
        }).sort((a,b)=>b.score-a.score).slice(0,10);

        let html = "";
        for(let i=0;i<2;i++){
            hotList.forEach(item=>{
                let s = getPatternStats(item.id);
                html += `
                <a href="detail.html?id=${item.id}" class="hot-pattern-card">
                    <img src="${item.mainImg}" class="hot-card-img">
                    <div class="hot-card-info">
                        <div class="hot-card-name">${item.name}</div>
                        <div class="hot-card-data">❤️${s.like} 👁${s.view} 💬${s.comment.length}</div>
                    </div>
                </a>`;
            });
        }
        document.getElementById("hotScrollList").innerHTML = html;

        let v = getVisitorData();
        let vHtml = `<div style="text-align:center;padding:10px;color:#965a20;font-weight:bold;">👥今日访客：${v.today} 人 &nbsp; 🌐全站累计访问：${v.total} 次</div>`;
        document.querySelector(".header").insertAdjacentHTML("afterend",vHtml);
    });
}

// 纹样库
if(location.href.includes("pattern")){
    window.onload = function(){
        let v = getVisitorData();
        let vHtml = `<div style="text-align:center;padding:8px 0;color:#965a20;">👥今日访客：${v.today} 人 &nbsp; 🌐总访问：${v.total} 次</div>`;
        document.querySelector(".top-search-bar").insertAdjacentHTML("beforebegin",vHtml);
    }
}

// 详情页
if(location.href.includes("detail")){
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

    let likeFlag = localStorage.getItem(`like_${pid}`)==="1";
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
            box.innerHTML += `
            <div class="comment-item">
                <div>
                    <span>${item.time}</span>
                    <p>${item.content}</p>
                </div>
                <button class="del-btn" onclick="delCmt(${idx})">删除</button>
            </div>`;
        });
    }
    window.delCmt = function(idx){
        if(!confirm("确定删除？"))return;
        stats.comment.splice(idx,1);
        localStorage.setItem(`comment_${pid}`,JSON.stringify(stats.comment));
        renderComment();
    };

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
    };
    renderComment();

    let v = getVisitorData();
    let vTip = `<div style="background:#fff;padding:10px;border-radius:8px;margin:15px 0;text-align:center;color:#666;">👥今日访客：${v.today} &nbsp; 全站累计：${v.total}</div>`;
    document.querySelector(".info-card").insertAdjacentHTML("afterend",vTip);
}