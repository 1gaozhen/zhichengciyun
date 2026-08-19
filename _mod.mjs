<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ============ DATA ============
const STYLES=['青花瓷','粉彩','釉下五彩','现代简约'];
const MOTIFS=['缠枝莲','牡丹','如意云','梅枝','菊花','山水','海水江崖','葡萄','寿桃','葫芦','蝙蝠','龙纹','凤纹','麒麟','婴戏','吉语字','回纹','冰裂纹'];
const LAYOUTS=['满地','开光','散点','边饰'];
const VESSELS=['方幅','花瓶','茶具','瓷盘','瓷砖','装饰画'];
const COLOR_SCHEMES={
  '经典青花':{body:'#e8eef5',main:'#1e4d8c',sub:'#4a7ab5',accent:'#133258',line:'#0f2a43'},
  '浅翠青花':{body:'#e8f5ee',main:'#2a6b4a',sub:'#5a9b78',accent:'#1a4a32',line:'#0f3a22'},
  '青花描金':{body:'#f0ead8',main:'#1e4d8c',sub:'#4a7ab5',accent:'#c9a961',line:'#0f2a43'},
  '粉彩牡丹':{body:'#fdf5f0',main:'#d4567a',sub:'#e89aaf',accent:'#c9a961',line:'#8a3a5a'},
  '红金缠枝':{body:'#fff5f0',main:'#a8323a',sub:'#d4656e',accent:'#c9a961',line:'#7a2228'},
  '墨白素雅':{body:'#f4f4f4',main:'#2a2a2a',sub:'#5a5a5a',accent:'#8a8a8a',line:'#1a1a1a'},
  '青绿设色':{body:'#eef5e8',main:'#3a7a5a',sub:'#6aa88a',accent:'#2a5a3a',line:'#1a3a2a'},
  '釉下五彩':{body:'#f4f1ea',main:'#1e4d8c',sub:'#d4567a',accent:'#4a7c59',line:'#0f2a43'},
  '自定义配色':{body:'#f4f1ea',main:'#1e4d8c',sub:'#4a7ab5',accent:'#c9a961',line:'#0f2a43',custom:true}
};

const PATTERN_LIB=[
  {name:'青花菊花纹',dyn:'明代',cat:'花卉纹样',desc:'菊花象征长寿高洁，多作散点折枝或团花点缀。',motif:'菊花',scheme:'经典青花'},
  {name:'青花繁复缠枝花纹',dyn:'清代',cat:'花卉纹样',desc:'缠枝纹连绵不断，寓意生生不息，宜满工繁密大件。',motif:'缠枝莲',scheme:'经典青花'},
  {name:'青花龙纹纹样',dyn:'明清通用',cat:'瑞兽纹样',desc:'龙为祥瑞与皇权象征，常与海水、云纹相配，气势恢宏。',motif:'龙纹',scheme:'经典青花'},
  {name:'青花缠枝大花纹',dyn:'明代',cat:'花卉纹样',desc:'以大朵缠枝花为主纹，饱满富丽，多用于瓶罐腹部。',motif:'缠枝莲',scheme:'经典青花'},
  {name:'青花福禄平安多子纹',dyn:'清代',cat:'吉祥纹样',desc:'以葫芦（福禄）、石榴等组合，寄寓平安多福。',motif:'葫芦',scheme:'经典青花'},
  {name:'青花葡萄纹',dyn:'明代',cat:'果蔬纹样',desc:'葡萄藤蔓绵延、果实累累，寓意多子丰收。',motif:'葡萄',scheme:'经典青花'},
  {name:'青花缠枝牡丹纹',dyn:'明代',cat:'花卉纹样',desc:'牡丹为花中之王，缠枝牡丹象征富贵连绵，是青花经典母题。',motif:'牡丹',scheme:'经典青花'},
  {name:'青花凤凰纹样',dyn:'明清通用',cat:'瑞兽纹样',desc:'凤凰喻祥瑞，常与牡丹相配成「凤穿牡丹」，华美庄重。',motif:'凤纹',scheme:'经典青花'},
  {name:'青花折枝小花纹',dyn:'明代',cat:'花卉纹样',desc:'折枝小花清新疏朗，于留白处点缀，雅致灵动。',motif:'梅枝',scheme:'经典青花'},
  {name:'青花缠枝团花纹样',dyn:'清代',cat:'花卉纹样',desc:'团花呈圆形适合纹，缠枝环绕，团圆圆满。',motif:'缠枝莲',scheme:'经典青花'},
  {name:'青花富贵平安纹',dyn:'清代',cat:'吉祥纹样',desc:'以花瓶、牡丹等组合，寄寓富贵平安，常见于贺礼用瓷。',motif:'牡丹',scheme:'青花描金'},
  {name:'青花祥龙纳福纹',dyn:'清代',cat:'瑞兽纹样',desc:'祥龙戏珠、纳福呈祥，与云水相映，多用于盘心主纹。',motif:'龙纹',scheme:'青花描金'},
  {name:'青花吉语文字纹',dyn:'清代',cat:'文字纹样',desc:'以「福」「寿」等吉语文字入纹，直白传递祝福寓意。',motif:'吉语字',scheme:'经典青花'},
  {name:'青花瑞兽纹样',dyn:'明代',cat:'瑞兽纹样',desc:'麒麟、瑞兽等祥禽瑞兽，寓意太平呈祥、镇宅纳福。',motif:'麒麟',scheme:'经典青花'},
  {name:'青花寿桃吉祥纹',dyn:'清代',cat:'吉祥纹样',desc:'寿桃寄寓长寿康宁，常与蝙蝠、石榴组合成吉祥图。',motif:'寿桃',scheme:'青花描金'},
  {name:'青花婴戏多子纹',dyn:'明代',cat:'吉祥纹样',desc:'童子嬉戏、寓意多子多福，题材活泼、生活气息浓厚。',motif:'婴戏',scheme:'经典青花'},
  {name:'青花团花纹样',dyn:'明代',cat:'花卉纹样',desc:'团花呈规整圆形，中心对称、饱满团圆，宜做主纹或边饰。',motif:'牡丹',scheme:'经典青花'}
];

const CLASS_DATA=[
  {num:'01',title:'青花瓷的起源与发展',desc:'青花瓷始于唐代，在明清达到顶峰，是中国瓷器中最具代表性的品类。'},
  {num:'02',title:'陶瓷纹样的文化寓意',desc:'龙纹象征权威、牡丹象征富贵、蝙蝠象征福气、鱼纹象征年年有余。'},
  {num:'03',title:'传统陶瓷制作72道工序',desc:'从采土、揉泥、拉坯、利坯、施釉到烧制，每一步都是千年传承。'}
];

const TECH_DATA=[
  {num:'01',title:'三轴 CNC 精密运动控制',desc:'自主研发底层运动算法，搭配精密滚珠丝杠，机械臂重复定位精度 ±0.02mm，专适配陶瓷弧形、异形坯体，解决曲面绘制偏移与抖动。'},
  {num:'02',title:'双目结构光三维重建与视觉定位',desc:'工业相机采集坯体点云，自动识别器型轮廓，智能规划纹样排布路径，无需人工校准。'},
  {num:'03',title:'多模态 AI 纹样生成引擎',desc:'输入风格、题材关键词即可自动生成适配陶瓷烧制工艺的传统 / 国潮纹样，支持古纹修复、风格迁移，设计效率提升 3 倍。'},
  {num:'04',title:'多模态协同自适应控制',desc:'融合视觉与压力传感数据，动态调节机械臂扎图力度，避免刮伤釉面，复刻非遗手工笔触。'},
  {num:'05',title:'轻量化 EtherCAT 工业总线',desc:'将设备指令延迟压缩至 8ms 内，支持多设备同步协同作业，适配陶瓷集群化生产。'}
];
const PLATFORM_DATA=[
  {icon:'🦾',title:'硬件终端',desc:'模块化三轴智能扎图机械臂，可换末端执行器，支持扎图、雕刻、铺色多工序，负载 2–50KG 分级可选'},
  {icon:'☁️',title:'云端 AI 设计平台',desc:'百万级非遗纹样素材库、AI 纹样生成工具、坯体三维预览、定制订单管理'},
  {icon:'🔌',title:'开发者开放平台',desc:'全套运动控制 SDK、纹样授权交易系统、工艺仿真测试工具'}
];
const SCENARIO_DATA=[
  {num:'01',title:'陶瓷产业生产',desc:'醴陵、景德镇、德化等产区中小型陶瓷厂，替代手工扎图，实现日用瓷、艺术瓷批量柔性定制'},
  {num:'02',title:'文创 IP 开发',desc:'潮玩、茶具、陶瓷摆件品牌，依托 AI 纹样库快速开发国潮联名产品'},
  {num:'03',title:'非遗文旅体验',desc:'陶瓷景区、非遗体验馆，面向游客提供 AI 设计 + 机械臂现场制瓷体验'},
  {num:'04',title:'教育研学',desc:'高校自动化、艺术设计专业，中小学非遗课堂，作为数字化传承教学教具'},
  {num:'05',title:'跨非遗延伸',desc:'后续可拓展湘绣、剪纸、木雕等传统手工艺的数字化复刻'}
];
const ADV_DATA=[
  {title:'技术壁垒',desc:'融合 3D 视觉 + 多模态 AI + 自适应运动控制，±0.02mm 微米级精度，独家适配釉下五彩扎图工艺'},
  {title:'数据独家',desc:'实地采集景德镇、醴陵历代古瓷粉本与非遗纹样，联合非遗传承人校验，竞品无垂直陶瓷素材库'},
  {title:'模式创新',desc:'「硬件销售 / 租赁 + 纹样订阅 + 设计师 IP 分成 + 非遗咨询」多元盈利，三方共赢'},
  {title:'落地渠道',desc:'深耕醴陵核心产区，拥有实体工坊长期试点，叠加非遗传承人背书，公信力领先'},
  {title:'成本适配',desc:'模块化分级定价，基础版 / 专业版 / 租赁套餐，降低中小作坊采购门槛'}
];
const SHOWCASE_DATA=[
  {label:'青花缠枝莲 · 开光',motif:'缠枝莲',scheme:'经典青花'},
  {label:'青花海水江崖 · 满地',motif:'海水江崖',scheme:'经典青花'},
  {label:'粉彩牡丹 · 散点',motif:'牡丹',scheme:'粉彩牡丹'},
  {label:'现代几何回纹 · 边饰',motif:'回纹',scheme:'青绿设色'},
  {label:'粉彩如意云 · 开光',motif:'如意云',scheme:'粉彩牡丹'},
  {label:'青花梅枝 · 散点',motif:'梅枝',scheme:'经典青花'},
  {label:'醴陵釉下五彩 · 缠枝牡丹',motif:'牡丹',scheme:'釉下五彩'},
  {label:'毛瓷雅彩 · 花鸟',motif:'菊花',scheme:'青花描金'}
];
const ECO_DATA=[
  {icon:'📚',title:'纹样宝库',desc:'收录明清经典青花、唐三彩、汝瓷等纹样，支持分类、搜索，查看纹样详情与历史背景。'},
  {icon:'💬',title:'纹样论坛',desc:'用户自主上传分享原创纹样，互相点赞、浏览、评论交流。'},
  {icon:'🎓',title:'陶瓷小课堂',desc:'了解陶瓷纹样历史渊源、文化寓意、制作工艺。'},
  {icon:'🏛️',title:'数字博物馆',desc:'沉浸式浏览历代经典陶瓷器物，高清展示纹样细节。'}
];

// ============ STATE ============
const state={
  style:'青花瓷',motif:'缠枝莲',layout:'满地',vessel:'花瓶',
  density:55,scheme:'经典青花',
  layers:{body:true,main:true,sub:true,accent:true,line:true},
  collection:[],view:'3d',autoRot:true,
  aiImageUrl:null,aiModel:'Kwai-Kolors/Kolors',aiBusy:false,
  refName:null,
  dyedCanvas:null   // 缓存按当前配色染色后的 Canvas，buildVessel 同步复用，避免每次切换器型重新加载图片
};

// ============ PATTERN GENERATOR (SVG) ============
function rnd(seed){let x=Math.sin(seed)*10000;return x-Math.floor(x);}
function buildSVG(w,h,opts={}){
  const s={...state,...opts};
  const colors=COLOR_SCHEMES[s.scheme]||COLOR_SCHEMES['经典青花'];
  const density=s.density/100;
  const layers=s.layers;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  // background (porcelain body)
  if(layers.body) svg+=`<rect width="${w}" height="${h}" fill="${colors.body}"/>`;
  // subtle crackle for ice-crackle style
  if(s.motif==='冰裂纹' && layers.main){
    for(let i=0;i<40*density+10;i++){
      const x1=rnd(i*7)*w,y1=rnd(i*11)*h;
      const x2=x1+(rnd(i*13)-.5)*80,y2=y1+(rnd(i*17)-.5)*80;
      svg+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.main}" stroke-width="0.5" opacity="0.4"/>`;
    }
  }
  if(layers.main){
    if(s.layout==='满地'||s.layout==='边饰'){
      // scrolling vine (缠枝) base
      if(['缠枝莲','牡丹','葡萄'].includes(s.motif)){
        const vineCount=Math.floor(3+density*4);
        for(let v=0;v<vineCount;v++){
          const y=h*(v+0.5)/vineCount;
          let d=`M -20 ${y} `;
          for(let x=0;x<=w+20;x+=20){
            d+=`Q ${x+10} ${y-30+rnd(v*7+x)*20} ${x+20} ${y} `;
          }
          svg+=`<path d="${d}" fill="none" stroke="${colors.sub}" stroke-width="2" opacity="0.6"/>`;
        }
      }
      const motifCount=Math.floor(6+density*30);
      for(let i=0;i<motifCount;i++){
        const cx=rnd(i*3+1)*w,cy=rnd(i*5+7)*h;
        const sz=15+rnd(i*11)*25*(0.6+density);
        svg+=drawMotif(cx,cy,sz,s.motif,colors,layers);
      }
      // border decoration
      if(s.layout==='边饰'){
        for(let x=0;x<w;x+=24){
          svg+=`<rect x="${x}" y="6" width="12" height="8" fill="${colors.accent}" opacity="0.7"/>`;
          svg+=`<rect x="${x}" y="${h-14}" width="12" height="8" fill="${colors.accent}" opacity="0.7"/>`;
        }
      }
    } else if(s.layout==='开光'){
      // frame
      const fx=w*0.12,fy=h*0.12;
      svg+=`<rect x="${fx}" y="${fy}" width="${w-2*fx}" height="${h-2*fy}" fill="none" stroke="${colors.accent}" stroke-width="3" rx="20"/>`;
      // fill outside frame with dense pattern
      const bgCount=Math.floor(20+density*40);
      for(let i=0;i<bgCount;i++){
        const cx=rnd(i*3)*w,cy=rnd(i*7)*h;
        if(cx>fx&&cx<w-fx&&cy>fy&&cy<h-fy) continue;
        svg+=drawMotif(cx,cy,12+rnd(i)*18,s.motif,colors,layers);
      }
      // centered motif inside frame
      const innerCount=Math.floor(2+density*8);
      for(let i=0;i<innerCount;i++){
        const cx=fx+(w-2*fx)*(0.2+rnd(i*5)*0.6);
        const cy=fy+(h-2*fy)*(0.2+rnd(i*9)*0.6);
        svg+=drawMotif(cx,cy,30+rnd(i)*25,s.motif,colors,layers);
      }
    } else if(s.layout==='散点'){
      const count=Math.floor(4+density*16);
      for(let i=0;i<count;i++){
        const cx=w*(0.1+rnd(i*3)*0.8),cy=h*(0.1+rnd(i*7)*0.8);
        svg+=drawMotif(cx,cy,25+rnd(i*11)*30,s.motif,colors,layers);
      }
    }
  }
  // signature line
  if(layers.line){
    svg+=`<line x1="0" y1="${h-2}" x2="${w}" y2="${h-2}" stroke="${colors.line}" stroke-width="1" opacity="0.3"/>`;
  }
  svg+=`</svg>`;
  return svg;
}
function drawMotif(cx,cy,sz,motif,colors,layers){
  let g='';
  switch(motif){
    case '缠枝莲': case '牡丹':
      // flower: layered petals
      if(layers.main){
        const petals=8;
        for(let p=0;p<petals;p++){
          const a=(p/petals)*Math.PI*2;
          const px=cx+Math.cos(a)*sz*0.4,py=cy+Math.sin(a)*sz*0.4;
          g+=`<ellipse cx="${px}" cy="${py}" rx="${sz*0.5}" ry="${sz*0.25}" fill="${colors.main}" opacity="0.85" transform="rotate(${a*180/Math.PI} ${px} ${py})"/>`;
        }
        g+=`<circle cx="${cx}" cy="${cy}" r="${sz*0.35}" fill="${colors.accent}"/>`;
        g+=`<circle cx="${cx}" cy="${cy}" r="${sz*0.15}" fill="${colors.body}"/>`;
      }
      if(layers.sub){
        for(let p=0;p<5;p++){
          const a=(p/5)*Math.PI*2+0.3;
          g+=`<path d="M ${cx} ${cy} Q ${cx+Math.cos(a)*sz*1.2} ${cy+Math.sin(a)*sz*1.2} ${cx+Math.cos(a)*sz*1.6} ${cy+Math.sin(a)*sz*1.6}" stroke="${colors.sub}" stroke-width="1.5" fill="none" opacity="0.5"/>`;
        }
      }
      break;
    case '菊花':
      if(layers.main){
        for(let p=0;p<16;p++){
          const a=(p/16)*Math.PI*2;
          g+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*sz}" y2="${cy+Math.sin(a)*sz}" stroke="${colors.main}" stroke-width="2" opacity="0.8"/>`;
        }
        g+=`<circle cx="${cx}" cy="${cy}" r="${sz*0.25}" fill="${colors.accent}"/>`;
      }
      break;
    case '如意云':
      if(layers.main){
        g+=`<path d="M ${cx-sz} ${cy} Q ${cx-sz} ${cy-sz} ${cx} ${cy-sz*0.5} Q ${cx+sz} ${cy-sz} ${cx+sz} ${cy} Q ${cx+sz} ${cy+sz} ${cx} ${cy+sz*0.5} Q ${cx-sz} ${cy+sz} ${cx-sz} ${cy} Z" fill="${colors.main}" opacity="0.7"/>`;
        g+=`<circle cx="${cx-sz*0.4}" cy="${cy}" r="${sz*0.15}" fill="${colors.accent}"/>`;
        g+=`<circle cx="${cx+sz*0.4}" cy="${cy}" r="${sz*0.15}" fill="${colors.accent}"/>`;
      }
      break;
    case '梅枝':
      if(layers.main){
        g+=`<path d="M ${cx-sz} ${cy+sz*0.6} Q ${cx} ${cy} ${cx+sz} ${cy-sz*0.3}" stroke="${colors.line}" stroke-width="3" fill="none"/>`;
        for(let f=0;f<6;f++){
          const fx=cx-sz+rnd(f*3)*sz*2,fy=cy+sz*0.6-rnd(f*5)*sz*0.9;
          g+=`<circle cx="${fx}" cy="${fy}" r="${sz*0.18}" fill="${colors.main}" opacity="0.85"/>`;
          g+=`<circle cx="${fx}" cy="${fy}" r="${sz*0.06}" fill="${colors.accent}"/>`;
        }
      }
      break;
    case '山水':
      if(layers.main){
        g+=`<path d="M ${cx-sz} ${cy+sz*0.5} L ${cx-sz*0.5} ${cy-sz*0.3} L ${cx} ${cy+sz*0.2} L ${cx+sz*0.5} ${cy-sz*0.5} L ${cx+sz} ${cy+sz*0.5} Z" fill="${colors.main}" opacity="0.7"/>`;
      }
      break;
    case '海水江崖':
      if(layers.main){
        let d=`M ${cx-sz} ${cy}`;
        for(let x=-sz;x<=sz;x+=sz*0.3){d+=` Q ${x+sz*0.15} ${cy-sz*0.3} ${x+sz*0.3} ${cy}`;}
        g+=`<path d="${d}" fill="none" stroke="${colors.main}" stroke-width="2"/>`;
        g+=`<path d="M ${cx-sz*0.6} ${cy+sz*0.3} L ${cx-sz*0.3} ${cy-sz*0.2} L ${cx} ${cy+sz*0.4} L ${cx+sz*0.3} ${cy-sz*0.3} L ${cx+sz*0.6} ${cy+sz*0.3}" fill="${colors.accent}" opacity="0.6"/>`;
      }
      break;
    case '葡萄':
      if(layers.main){
        for(let r=0;r<4;r++)for(let c=0;c<4-r;c++){
          const px=cx+(c-r/2)*sz*0.3,py=cy+r*sz*0.3;
          g+=`<circle cx="${px}" cy="${py}" r="${sz*0.18}" fill="${colors.main}" opacity="0.85"/>`;
        }
        g+=`<path d="M ${cx} ${cy-sz*0.3} L ${cx-sz*0.5} ${cy-sz}" stroke="${colors.sub}" stroke-width="2" fill="none"/>`;
      }
      break;
    case '寿桃':
      if(layers.main){
        g+=`<path d="M ${cx} ${cy-sz*0.8} Q ${cx+sz} ${cy-sz*0.3} ${cx+sz*0.3} ${cy+sz*0.7} Q ${cx} ${cy+sz} ${cx-sz*0.3} ${cy+sz*0.7} Q ${cx-sz} ${cy-sz*0.3} ${cx} ${cy-sz*0.8} Z" fill="${colors.main}" opacity="0.85"/>`;
        g+=`<path d="M ${cx} ${cy-sz*0.8} L ${cx-sz*0.3} ${cy-sz*1.3}" stroke="${colors.sub}" stroke-width="2" fill="none"/>`;
      }
      break;
    case '葫芦':
      if(layers.main){
        g+=`<circle cx="${cx}" cy="${cy-sz*0.3}" r="${sz*0.45}" fill="${colors.main}" opacity="0.85"/>`;
        g+=`<circle cx="${cx}" cy="${cy+sz*0.4}" r="${sz*0.6}" fill="${colors.main}" opacity="0.85"/>`;
      }
      break;
    case '蝙蝠':
      if(layers.main){
        g+=`<path d="M ${cx-sz} ${cy} Q ${cx-sz*0.5} ${cy-sz*0.8} ${cx} ${cy-sz*0.2} Q ${cx+sz*0.5} ${cy-sz*0.8} ${cx+sz} ${cy} Q ${cx+sz*0.5} ${cy+sz*0.3} ${cx} ${cy+sz*0.1} Q ${cx-sz*0.5} ${cy+sz*0.3} ${cx-sz} ${cy} Z" fill="${colors.main}" opacity="0.8"/>`;
        g+=`<circle cx="${cx}" cy="${cy-sz*0.1}" r="${sz*0.12}" fill="${colors.accent}"/>`;
      }
      break;
    case '龙纹': case '凤纹': case '麒麟':
      if(layers.main){
        g+=`<path d="M ${cx-sz} ${cy+sz*0.3} Q ${cx-sz*0.5} ${cy-sz} ${cx} ${cy} Q ${cx+sz*0.5} ${cy+sz} ${cx+sz} ${cy-sz*0.3}" stroke="${colors.main}" stroke-width="3" fill="none"/>`;
        g+=`<circle cx="${cx+sz*0.8}" cy="${cy-sz*0.3}" r="${sz*0.2}" fill="${colors.accent}"/>`;
        if(layers.sub){
          for(let i=0;i<5;i++){
            g+=`<path d="M ${cx-sz+i*sz*0.4} ${cy+sz*0.3} l ${sz*0.1} ${sz*0.4}" stroke="${colors.sub}" stroke-width="2"/>`;
          }
        }
      }
      break;
    case '婴戏':
      if(layers.main){
        g+=`<circle cx="${cx}" cy="${cy-sz*0.4}" r="${sz*0.3}" fill="${colors.main}" opacity="0.85"/>`;
        g+=`<rect x="${cx-sz*0.25}" y="${cy-sz*0.1}" width="${sz*0.5}" height="${sz*0.6}" rx="3" fill="${colors.main}" opacity="0.7"/>`;
      }
      break;
    case '吉语字':
      if(layers.main){
        const chars=['福','寿','喜','吉'];
        g+=`<text x="${cx}" y="${cy}" font-size="${sz*1.2}" fill="${colors.main}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-weight="bold">${chars[Math.floor(rnd(cx+cy)*chars.length)%chars.length]}</text>`;
      }
      break;
    case '回纹':
      if(layers.main){
        let d=`M ${cx} ${cy-sz*0.5} L ${cx+sz*0.5} ${cy-sz*0.5} L ${cx+sz*0.5} ${cy+sz*0.5} L ${cx-sz*0.5} ${cy+sz*0.5} L ${cx-sz*0.5} ${cy} L ${cx+sz*0.2} ${cy} L ${cx+sz*0.2} ${cy+sz*0.3} L ${cx-sz*0.2} ${cy+sz*0.3}`;
        g+=`<path d="${d}" stroke="${colors.main}" stroke-width="2" fill="none"/>`;
      }
      break;
    case '冰裂纹':
      // handled in main loop
      break;
    default:
      if(layers.main) g+=`<circle cx="${cx}" cy="${cy}" r="${sz*0.4}" fill="${colors.main}" opacity="0.7"/>`;
  }
  if(layers.accent){
    g+=`<circle cx="${cx}" cy="${cy}" r="${sz*0.08}" fill="${colors.accent}" opacity="0.9"/>`;
  }
  return g;
}

// render SVG to data URL for texture
function svgToDataURL(svg){
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

// ============ 3D SCENE ============
let scene,camera,renderer,controls,envMap;
let currentMesh=null;
let pmremGenerator;
const stageEl=document.getElementById('threeStage');

function init3D(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0xdde8f3);
  // fog for depth
  scene.fog=new THREE.Fog(0xdde8f3,9,20);

  camera=new THREE.PerspectiveCamera(38,stageEl.clientWidth/stageEl.clientHeight,0.1,100);
  camera.position.set(0,1.2,6.2);

  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setSize(stageEl.clientWidth,stageEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  stageEl.appendChild(renderer.domElement);

  // environment for glaze reflections
  pmremGenerator=new THREE.PMREMGenerator(renderer);
  envMap=pmremGenerator.fromScene(new RoomEnvironment(),0.04).texture;
  scene.environment=envMap;

  // ===== 三点布光（影棚级，凸显釉面光泽） =====
  const ambient=new THREE.AmbientLight(0xffffff,0.45);
  scene.add(ambient);

  // 主光：右上前方，柔和硬阴影
  const keyLight=new THREE.DirectionalLight(0xffffff,1.6);
  keyLight.position.set(4,7,5);
  keyLight.castShadow=true;
  keyLight.shadow.mapSize.set(2048,2048);
  keyLight.shadow.camera.near=0.5;
  keyLight.shadow.camera.far=22;
  keyLight.shadow.camera.left=-4;
  keyLight.shadow.camera.right=4;
  keyLight.shadow.camera.top=5;
  keyLight.shadow.camera.bottom=-5;
  keyLight.shadow.bias=-0.0004;
  keyLight.shadow.radius=4;
  scene.add(keyLight);

  // 辅光：左前，冷色补暗部
  const fillLight=new THREE.DirectionalLight(0xbcd4ee,0.55);
  fillLight.position.set(-5,3,3);
  scene.add(fillLight);

  // 轮廓光：后上方暖色，勾勒边缘高光
  const rimLight=new THREE.DirectionalLight(0xffe6c0,0.9);
  rimLight.position.set(-1,5,-5);
  scene.add(rimLight);

  // 顶部点光：釉面镜面反射高光
  const topLight=new THREE.PointLight(0xffffff,0.7,12,2);
  topLight.position.set(0,5,2);
  scene.add(topLight);

  // ground shadow plane
  const groundGeo=new THREE.CircleGeometry(4,64);
  const groundMat=new THREE.ShadowMaterial({opacity:0.28});
  const ground=new THREE.Mesh(groundGeo,groundMat);
  ground.rotation.x=-Math.PI/2;
  ground.position.y=-1.8;
  ground.receiveShadow=true;
  scene.add(ground);

  // 展台（深色木质托盘，边缘倒角）
  const pedGeo=new THREE.CylinderGeometry(1.5,1.65,0.28,72);
  const pedMat=new THREE.MeshStandardMaterial({color:0x26323f,roughness:0.55,metalness:0.35,envMapIntensity:0.8});
  const pedestal=new THREE.Mesh(pedGeo,pedMat);
  pedestal.position.y=-1.94;
  pedestal.receiveShadow=true;
  pedestal.castShadow=true;
  scene.add(pedestal);
  // 展台顶部细高光圈
  const ringGeo=new THREE.TorusGeometry(1.5,0.018,12,72);
  const ringMat=new THREE.MeshStandardMaterial({color:0xc9a961,roughness:0.3,metalness:0.9,envMapIntensity:1.2});
  const ring=new THREE.Mesh(ringGeo,ringMat);
  ring.rotation.x=Math.PI/2;
  ring.position.y=-1.8;
  scene.add(ring);

  // controls
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;
  controls.dampingFactor=0.08;
  controls.minDistance=3;
  controls.maxDistance=10;
  controls.minPolarAngle=0.25;
  controls.maxPolarAngle=Math.PI-0.25;
  controls.autoRotate=true;
  controls.autoRotateSpeed=1.4;
  controls.enablePan=false;

  window.addEventListener('resize',onResize);
  animate();
}

function onResize(){
  if(!renderer) return;
  camera.aspect=stageEl.clientWidth/stageEl.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stageEl.clientWidth,stageEl.clientHeight);
}

function animate(){
  requestAnimationFrame(animate);
  if(controls) controls.update();
  if(renderer) renderer.render(scene,camera);
}

// 用 CatmullRom 样条平滑器型剖面：控制点 [半径,高度] → 平滑 Vector2 曲线
function smoothProfile(ctrl,samples=120){
  const pts=ctrl.map(c=>new THREE.Vector3(c[0],c[1],0));
  const curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',0.5);
  const sp=curve.getSpacedPoints(samples);
  return sp.map(p=>new THREE.Vector2(Math.max(p.x,0.001),p.y));
}

// 各器型剖面控制点 [半径, 高度] —— 参照传统瓷器形制，含圈足与外撇口沿
const VESSEL_PROFILES={
  // 玉壶春瓶：撇口、长颈、垂腹、圈足
  '花瓶':[
    [0.001,-1.70],[0.40,-1.69],[0.45,-1.64],[0.53,-1.62],
    [0.60,-1.55],[0.68,-1.28],[0.78,-0.80],[0.82,-0.10],
    [0.78,0.45],[0.55,0.82],[0.36,1.12],[0.33,1.34],
    [0.37,1.45],[0.51,1.58]
  ],
  // 梅瓶：小口、丰肩、敛腹、圈足
  '梅瓶':[
    [0.001,-1.70],[0.40,-1.69],[0.46,-1.64],[0.54,-1.61],
    [0.58,-1.50],[0.60,-1.05],[0.66,-0.55],[0.73,-0.05],
    [0.74,0.35],[0.66,0.65],[0.50,0.92],[0.36,1.18],
    [0.31,1.40],[0.35,1.54]
  ],
  // 茶壶身：敛口、鼓腹、圈足（盖另加）
  '茶具':[
    [0.001,-1.15],[0.50,-1.13],[0.72,-1.02],[0.92,-0.72],
    [1.02,-0.30],[1.00,0.12],[0.86,0.46],[0.62,0.66],
    [0.48,0.73],[0.001,0.75]
  ],
  // 浅腹盘：坦底、卷唇
  '瓷盘':[
    [0.001,-0.14],[0.50,-0.13],[1.10,-0.10],[1.45,-0.04],
    [1.42,0.05],[1.30,0.11],[1.05,0.12],[0.001,0.11]
  ]
};

// 生成锥形管（用于壶嘴：根部粗、端口细）
function taperedTube(curve,rStart,rEnd,tubularSegs,radialSegs){
  const frames=curve.computeFrenetFrames(tubularSegs,false);
  const positions=[],uvs=[];
  for(let i=0;i<=tubularSegs;i++){
    const t=i/tubularSegs;
    const P=curve.getPoint(t);
    const N=frames.normals[i],B=frames.binormals[i];
    const r=rStart*(1-t)+rEnd*t;
    for(let j=0;j<=radialSegs;j++){
      const a=j/radialSegs*Math.PI*2;
      const s=Math.sin(a),c=Math.cos(a);
      positions.push(P.x+N.x*c*r+B.x*s*r,P.y+N.y*c*r+B.y*s*r,P.z+N.z*c*r+B.z*s*r);
      uvs.push(t,j/radialSegs);
    }
  }
  const idx=[];
  for(let i=0;i<tubularSegs;i++)for(let j=0;j<radialSegs;j++){
    const a=i*(radialSegs+1)+j,b=a+radialSegs+1;
    idx.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.computeVertexNormals();
  return g;
}

// 装饰弦纹（颈/足处细金线或主色线）
function addBand(group,y,radius,color,thickness=0.012){
  const g=new THREE.TorusGeometry(Math.max(radius,0.05),thickness,10,80);
  const m=new THREE.MeshStandardMaterial({color,roughness:0.25,metalness:0.85,envMapIntensity:1.2});
  const ring=new THREE.Mesh(g,m);
  ring.rotation.x=Math.PI/2;ring.position.y=y;
  ring.castShadow=true;
  group.add(ring);
}

// 平面器型边框：四边金属/木质立边，凸显画心
function addFrame(group,w,h,depth,color,frameW=0.08){
  const mat=new THREE.MeshStandardMaterial({color,roughness:0.35,metalness:0.8,envMapIntensity:1.1});
  const hw=w/2,hh=h/2;
  const bars=[
    [w+frameW*2,frameW,depth,0,hh+frameW/2,depth*0.1],   // 上
    [w+frameW*2,frameW,depth,0,-hh-frameW/2,depth*0.1],  // 下
    [frameW,h,depth,-hw-frameW/2,0,depth*0.1],           // 左
    [frameW,h,depth,hw+frameW/2,0,depth*0.1]              // 右
  ];
  bars.forEach(b=>{
    const g=new THREE.BoxGeometry(b[0],b[1],b[2]);
    const m=new THREE.Mesh(g,mat);
    m.position.set(b[3],b[4],b[5]);m.castShadow=true;
    group.add(m);
  });
}

// 瓷盘圈足：底部小圆环
function addDiskFoot(group,footR,footH,y){
  const prof=[[0.001,0],[footR,0],[footR,footH],[0.001,footH]];
  const pts=prof.map(p=>new THREE.Vector2(Math.max(p[0],0.001),p[1]));
  const g=new THREE.LatheGeometry(pts,72);
  const m=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0.12,metalness:0,clearcoat:1,clearcoatRoughness:0.06,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(g,m);
  mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;
  group.add(mesh);
}

// 将黑白线描纹样按配色方案染色：黑线→纹色，白底→胎色（完整贴合釉面，非直接贴图）
function tintPatternCanvas(srcUrl,lineColorHex,bodyColorHex){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.crossOrigin='anonymous';
    img.onload=()=>{
      const size=512;
      const c=document.createElement('canvas');c.width=c.height=size;
      const ctx=c.getContext('2d');
      ctx.drawImage(img,0,0,size,size);
      try{
        const imgData=ctx.getImageData(0,0,size,size);
        const d=imgData.data;
        // 直接解析 hex（sRGB 0-255），避免 THREE.Color 线性色空间换算偏差
        const hx=lineColorHex.replace('#','');
        const lr=parseInt(hx.substr(0,2),16),lg=parseInt(hx.substr(2,2),16),lb=parseInt(hx.substr(4,2),16);
        // 胎色（底色），默认白
        let br=255,bg=255,bb=255;
        if(bodyColorHex){
          const bhx=bodyColorHex.replace('#','');
          br=parseInt(bhx.substr(0,2),16);bg=parseInt(bhx.substr(2,2),16);bb=parseInt(bhx.substr(4,2),16);
        }
        for(let i=0;i<d.length;i+=4){
          const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
          const dark=1-lum/255;          // 0=白底 1=黑线
          // 插值：黑线→纹色，白底→胎色
          d[i]  =lr*dark+br*(1-dark);
          d[i+1]=lg*dark+bg*(1-dark);
          d[i+2]=lb*dark+bb*(1-dark);
        }
        ctx.putImageData(imgData,0,0);
      }catch(e){ /* 跨域读取失败时返回未染色的原图画布 */ }
      resolve(c);
    };
    img.onerror=()=>reject(new Error('纹样图加载失败'));
    img.src=srcUrl;
  });
}

// 重建染色缓存：按当前 aiImageUrl + 配色染色一次，存到 state.dyedCanvas
// 之后切换器型/配色直接复用，纹样同步贴合，不重复加载图片
function rebuildDyedCanvas(){
  const colors=COLOR_SCHEMES[state.scheme];
  const srcUrl=state.aiImageUrl?('/api/image?url='+encodeURIComponent(state.aiImageUrl)):svgToDataURL(buildSVG(512,512));
  return tintPatternCanvas(srcUrl,colors.main,colors.body).then(c=>{
    state.dyedCanvas=c;
    return c;
  }).catch(()=>{ state.dyedCanvas=null; });
}
// 由缓存 Canvas 创建纹理（旋转体镜像平铺，平面体单贴）
function makeDyedTexture(repeatX,repeatY,mirror){
  if(!state.dyedCanvas) return null;
  const tex=new THREE.CanvasTexture(state.dyedCanvas);
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.wrapS=mirror?THREE.MirroredRepeatWrapping:THREE.ClampToEdgeWrapping;
  tex.wrapT=mirror?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;
  tex.repeat.set(repeatX||1,repeatY||1);
  tex.needsUpdate=true;
  return tex;
}

// Build vessel geometry by type
function buildVessel(type){
  const colors=COLOR_SCHEMES[state.scheme];
  const bodyColor=new THREE.Color(colors.body);
  const mainColor=new THREE.Color(colors.main);
  const accentColor=new THREE.Color(colors.accent);
  const goldColor=new THREE.Color(colors.accent===colors.accent?0xc9a961:colors.accent);
  const group=new THREE.Group();

  // 釉面材质：高光透明釉（clearcoat 拉满，粗糙度极低，加 sheen 模拟釉面柔光）
  const glazeMat=new THREE.MeshPhysicalMaterial({
    color:bodyColor,
    roughness:0.10,
    metalness:0.0,
    clearcoat:1.0,
    clearcoatRoughness:0.05,
    reflectivity:0.7,
    ior:1.45,
    envMapIntensity:1.35,
    sheen:0.6,
    sheenColor:new THREE.Color(0xffffff),
    sheenRoughness:0.25,
    side:THREE.DoubleSide
  });

  // ===== 瓷砖 / 方幅（平面板） =====
  if(type==='瓷砖'){
    const geo=new THREE.BoxGeometry(2.6,2.6,0.2,1,1,1);
    const mesh=new THREE.Mesh(geo,glazeMat);
    mesh.castShadow=true;mesh.receiveShadow=true;
    group.add(mesh);
    makePlanarPattern(type,tex=>{
      const pg=new THREE.PlaneGeometry(2.4,2.4);   // 画心略小于板面，留出边框
      const pm=new THREE.Mesh(pg,tex);
      pm.position.z=0.13;group.add(pm);   // 距底板表面 0.03，避免 z-fighting
    });
    addFrame(group,2.4,2.4,0.2,mainColor.getHex(),0.09);
    return group;
  }
  if(type==='方幅'||type==='装饰画'){
    const geo=new THREE.BoxGeometry(2.4,3,0.15,1,1,1);
    const mesh=new THREE.Mesh(geo,glazeMat);
    mesh.castShadow=true;mesh.receiveShadow=true;
    group.add(mesh);
    makePlanarPattern(type,tex=>{
      const pg=new THREE.PlaneGeometry(2.2,2.8);
      const pm=new THREE.Mesh(pg,tex);
      pm.position.z=0.11;group.add(pm);   // 距底板表面 0.035，避免 z-fighting
    });
    addFrame(group,2.2,2.8,0.15,goldColor.getHex(),0.08);
    return group;
  }

  // ===== 旋转体器型（花瓶/梅瓶/茶具/瓷盘） =====
  const ctrl=VESSEL_PROFILES[type]||VESSEL_PROFILES['花瓶'];
  const points=smoothProfile(ctrl);

  // 纹样：优先复用染色缓存（同步贴合），缓存缺失时异步染色
  glazeMat.color.setHex(0xffffff);  // 釉面贴图已含胎色背景，材质保持中性白避免二次染色
  const reps={花瓶:[2,2],梅瓶:[2,2],茶具:[2,2],瓷盘:[1,1]};
  const rp=reps[type]||[2,2];
  const cachedTex=makeDyedTexture(rp[0],rp[1],true);
  if(cachedTex){
    if(glazeMat.map) glazeMat.map.dispose();
    glazeMat.map=cachedTex;
    glazeMat.needsUpdate=true;
  }else{
    // 首次无缓存：异步染色并缓存，之后切换器型即可同步复用
    rebuildDyedCanvas().then(()=>{
      const tex=makeDyedTexture(rp[0],rp[1],true);
      if(tex){ if(glazeMat.map) glazeMat.map.dispose(); glazeMat.map=tex; glazeMat.needsUpdate=true; }
    });
  }
  const geo=new THREE.LatheGeometry(points,160);
  const mesh=new THREE.Mesh(geo,glazeMat);
  if(type==='瓷盘') mesh.rotation.x=-Math.PI/2;
  mesh.castShadow=true;mesh.receiveShadow=true;
  group.add(mesh);

  // 装饰弦纹（颈/足/肩）
  if(type==='花瓶'||type==='梅瓶'){
    addBand(group,-1.60,0.54,mainColor,0.014);            // 足弦纹
    addBand(group,-1.55,0.50,goldColor,0.007);            // 足上金线
    addBand(group,type==='花瓶'?-0.10:0.0,0.82,goldColor,0.006); // 肩部金线
    addBand(group,1.20,type==='花瓶'?0.34:0.36,mainColor,0.010); // 颈弦纹
    addBand(group,1.50,type==='花瓶'?0.50:0.36,goldColor,0.008); // 口沿金线
  }else if(type==='茶具'){
    addBand(group,-1.05,0.72,mainColor,0.012);            // 足弦纹
    addBand(group,-1.00,0.68,goldColor,0.006);            // 足上金线
    addBand(group,-0.28,1.02,goldColor,0.006);            // 肩部金线
  }else if(type==='瓷盘'){
    // 瓷盘：底部圈足 + 口沿金边
    addDiskFoot(group,0.55,0.06,-0.18);
    addBand(group,0.0,1.42,goldColor,0.010);
  }

  return group;
}

// 平面器型的纹样材质生成器（同样按配色染色）
function makePlanarPattern(type,addFn){
  const colors=COLOR_SCHEMES[state.scheme];
  const patternMat=new THREE.MeshPhysicalMaterial({
    color:0xffffff,roughness:0.2,metalness:0.0,clearcoat:0.85,clearcoatRoughness:0.1,
    transparent:true,opacity:0.97,envMapIntensity:1.0,side:THREE.DoubleSide,
    polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1  // 避免与底板 z-fighting
  });
  addFn(patternMat);
  // 优先复用染色缓存（同步贴合），缺失时异步染色
  const cachedTex=makeDyedTexture(1,1,false);
  if(cachedTex){
    if(patternMat.map) patternMat.map.dispose();
    patternMat.map=cachedTex;
    patternMat.needsUpdate=true;
  }else{
    rebuildDyedCanvas().then(()=>{
      const tex=makeDyedTexture(1,1,false);
      if(tex){ if(patternMat.map) patternMat.map.dispose(); patternMat.map=tex; patternMat.needsUpdate=true; }
    });
  }
}

// 茶壶配件：锥形流嘴、提梁把、盖、钮
function addTeapotParts(group){
  const colors=COLOR_SCHEMES[state.scheme];
  const mat=new THREE.MeshPhysicalMaterial({
    color:new THREE.Color(colors.body),
    roughness:0.10,metalness:0.0,clearcoat:1.0,clearcoatRoughness:0.05,
    envMapIntensity:1.35,sheen:0.6,sheenColor:new THREE.Color(0xffffff),sheenRoughness:0.25,
    side:THREE.DoubleSide
  });
  const goldMat=new THREE.MeshStandardMaterial({color:0xc9a961,roughness:0.3,metalness:0.9,envMapIntensity:1.2});
  // 流嘴：根部粗、端口细的弯管
  const spoutCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.85,-0.15,0),new THREE.Vector3(1.25,0.15,0),
    new THREE.Vector3(1.55,0.55,0),new THREE.Vector3(1.62,0.95,0)
  ]);
  const spout=new THREE.Mesh(taperedTube(spoutCurve,0.20,0.07,48,18),mat);
  spout.castShadow=true;group.add(spout);
  // 把手：C 形提梁（中空，更立体）
  const handleCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.62,0.55,0),new THREE.Vector3(-1.25,0.62,0),
    new THREE.Vector3(-1.45,0.20,0),new THREE.Vector3(-1.30,-0.30,0),
    new THREE.Vector3(-0.62,-0.20,0)
  ]);
  const handle=new THREE.Mesh(taperedTube(handleCurve,0.085,0.085,48,16),mat);
  handle.castShadow=true;group.add(handle);
  // 盖：扁圆穹盖
  const lidProf=smoothProfile([[0.001,0.0],[0.42,0.0],[0.48,0.04],[0.46,0.12],[0.001,0.14]],48);
  const lid=new THREE.Mesh(new THREE.LatheGeometry(lidProf,96),mat);
  lid.position.y=0.76;lid.castShadow=true;group.add(lid);
  // 盖钮：宝珠
  const knob=new THREE.Mesh(new THREE.SphereGeometry(0.10,32,24),goldMat);
  knob.position.y=0.96;knob.castShadow=true;group.add(knob);
  // 盖与钮之间小颈
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.08,24),goldMat);
  neck.position.y=0.88;group.add(neck);
}

function updateVessel(){
  if(currentMesh){
    scene.remove(currentMesh);
    currentMesh.traverse(o=>{
      if(o.geometry) o.geometry.dispose();
      if(o.material){
        if(o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
  }
  let obj=buildVessel(state.vessel);
  if(state.vessel==='茶具' && obj.isGroup) addTeapotParts(obj);
  currentMesh=obj;
  scene.add(currentMesh);
  document.getElementById('vesselLabel').textContent=state.vessel;
}

function toggleAutoRot(){
  state.autoRot=!state.autoRot;
  controls.autoRotate=state.autoRot;
  document.getElementById('autoRotBtn').classList.toggle('active',state.autoRot);
}
function resetView(){
  camera.position.set(0,1.5,6);
  controls.target.set(0,0,0);
  controls.update();
}

// expose to global
window.THREE_=THREE;
window.__scene={init3D,updateVessel,toggleAutoRot,resetView,onResize};

// ============ MUSEUM 3D ============
// 真实藏品数据（参考醴陵陶瓷博物馆官方藏品）
const MUSEUM_COLLECTION=[
  {id:'bian',name:'扁豆双禽凤尾尊',era:'清宣统三年(1911)',cat:'镇馆之宝',grade:'国家一级文物 · 镇馆之宝',size:'高46cm 口径20.5cm 底径12cm',motif:'扁豆双禽(鹌鹑)',vessel:'凤尾尊',color:0xf0ead8,photo:'lilingbowuguan.jpg',
   desc:'1915 年巴拿马太平洋万国博览会金奖作品，又名「巴拿马瓶」。器形凤尾尊，瓶口敞开如凤尾。绘黑色扁豆、紫色花丛，一对鹌鹑游戏其中。扁豆寓意丰收多子，鹌鹑取「安」意，象征安居乐业。采用双沟分水法，色调浓淡相宜，沉稳典雅。'},
  {id:'mao',name:'釉下五彩耄耋图琵琶尊',era:'清末',cat:'清末精品',grade:'国家二级文物',size:'高38cm',motif:'猫蝶(耄耋)',vessel:'琵琶尊',color:0x6ba4d8,photo:'liling1.jpg',
   desc:'耄耋图取「猫蝶」谐音「耄耋」，寓意长寿。釉下五彩工艺，色彩沉稳典雅，线条流畅，体现清末醴陵釉下五彩的成熟技艺。'},
  {id:'ying',name:'釉下五彩鹰纹瓷琵琶尊',era:'清宣统三年(1911)',cat:'清末精品',grade:'国家一级文物',size:'高42cm',motif:'鹰纹',vessel:'琵琶尊',color:0xd4567a,photo:'liling2.jpg',
   desc:'清宣统三年醴陵窑烧制，鹰纹刚劲有力，振翅欲飞，釉下五彩发色纯正，是清末醴陵瓷的代表作，彰显匠人对猛禽神态的精准捕捉。'},
  {id:'jinji',name:'复合彩刷花锦鸡牡丹纹凤尾尊',era:'清宣统',cat:'清末精品',grade:'国家二级文物',size:'高45cm',motif:'锦鸡牡丹',vessel:'凤尾尊',color:0x4a7c59,photo:'liling3.jpg',
   desc:'复合彩工艺，刷花技法表现锦鸡牡丹，色彩丰富，构图饱满，象征锦上添花、富贵吉祥。刷花工艺是醴陵釉下五彩的创新技法之一。'},
  {id:'baota',name:'玲珑宝塔',era:'近代',cat:'玲珑瓷',grade:'国家珍贵文物',size:'高52cm',motif:'玲珑纹',vessel:'宝塔',color:0xe8e0d0,photo:'liling4.jpg',
   desc:'玲珑瓷技法，塔身镂空透光，层层相叠，飞檐翘角，体现醴陵玲珑瓷的精巧工艺与匠人对建筑结构的细致还原。'},
  {id:'maoci',name:'毛主席用银边茶花纹瓷餐具',era:'1974年',cat:'毛瓷',grade:'国家礼品瓷',size:'多件套',motif:'茶花纹',vessel:'碗',color:0xc9a961,photo:'liling5.jpg',
   desc:'1974 年熊声贵绘制，醴陵款毛主席专用瓷。银边茶花纹，釉下五彩工艺，代表现代醴陵「毛瓷」的最高水平，被誉为「20 世纪最荣耀的中国陶瓷」。'},
  {id:'guoli',name:'釉下五彩"古路新韵"赏瓶',era:'2024年',cat:'国礼瓷',grade:'国家礼品瓷',size:'高48cm',motif:'丝绸之路',vessel:'赏瓶',color:0x6ba4d8,photo:'liling6.jpg',
   desc:'习近平主席赠乌兹别克斯坦总统国礼同款。以丝绸之路为脉络，一件从北京天坛起笔，融合长城、敦煌、撒马尔罕等地标；另一件以西安钟鼓楼为起点，描绘驼队沿丝路之旅，展现东西方文化交融。'},
  {id:'hua',name:'釉下五彩花卉纹瓷瓶',era:'1950年代',cat:'近现代',grade:'国家珍贵文物',size:'高36cm',motif:'花卉纹',vessel:'瓶',color:0xd4567a,photo:'liling1.jpg',
   desc:'1950 年代醴陵省陶研所吴寿祺绘，釉下五彩花卉纹，笔触细腻，代表新中国成立初期醴陵釉下五彩的传承与发展，是承前启后的代表作。'}
];

let mScene,mCam,mRenderer,mCtrl,mGroup,mRaycaster,mPointer,mCases=[],mActiveId=null,mTexLoader,mEnvMap,mHighlight=null;

// 根据器型返回 LatheGeometry 剖面点数组
function buildVesselGeometry(vessel){
  const V=THREE.Vector2;
  switch(vessel){
    case '凤尾尊':
      return [new V(0.001,-1),new V(0.35,-0.95),new V(0.45,-0.7),new V(0.58,-0.3),
        new V(0.62,0.1),new V(0.42,0.45),new V(0.3,0.62),new V(0.28,0.78),
        new V(0.46,0.92),new V(0.58,1.02),new V(0.001,1.12)];
    case '琵琶尊':
      return [new V(0.001,-1),new V(0.3,-0.95),new V(0.5,-0.7),new V(0.64,-0.3),
        new V(0.62,0.1),new V(0.46,0.45),new V(0.3,0.65),new V(0.28,0.82),
        new V(0.44,0.95),new V(0.001,1.05)];
    case '宝塔':
      return [new V(0.001,-1),new V(0.48,-0.92),new V(0.48,-0.72),new V(0.3,-0.66),
        new V(0.3,-0.46),new V(0.44,-0.4),new V(0.44,-0.2),new V(0.28,-0.14),
        new V(0.28,0.06),new V(0.42,0.12),new V(0.42,0.32),new V(0.26,0.38),
        new V(0.26,0.58),new V(0.36,0.64),new V(0.36,0.84),new V(0.22,0.9),new V(0.001,1.0)];
    case '碗':
      return [new V(0.001,-0.5),new V(0.42,-0.45),new V(0.5,-0.2),new V(0.54,0.1),
        new V(0.58,0.32),new V(0.001,0.38)];
    case '赏瓶':
      return [new V(0.001,-1),new V(0.3,-0.95),new V(0.52,-0.55),new V(0.6,-0.15),
        new V(0.56,0.25),new V(0.34,0.34),new V(0.22,0.72),new V(0.24,0.98),new V(0.001,1.02)];
    case '瓶':
    default:
      return [new V(0.001,-1),new V(0.32,-0.95),new V(0.52,-0.7),new V(0.56,-0.3),
        new V(0.52,0.12),new V(0.36,0.5),new V(0.28,0.8),new V(0.3,0.96),new V(0.001,1.0)];
  }
}

// 制作标签 Sprite
function makeLabelSprite(text){
  const cv=document.createElement('canvas');
  cv.width=256;cv.height=64;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='rgba(10,22,34,0.88)';
  ctx.fillRect(0,0,256,64);
  ctx.strokeStyle='rgba(201,169,97,0.7)';ctx.lineWidth=2;
  ctx.strokeRect(3,3,250,58);
  ctx.fillStyle='#e8d9b5';
  ctx.font='600 22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  const t=text.length>9?text.slice(0,9)+'…':text;
  ctx.fillText(t,128,32);
  const tex=new THREE.CanvasTexture(cv);
  tex.colorSpace=THREE.SRGBColorSpace;
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  spr.scale.set(1.3,0.33,1);
  return spr;
}

function initMuseum(){
  const el=document.getElementById('museum3d');
  document.getElementById('msLoading')?.remove();

  mScene=new THREE.Scene();
  mScene.background=new THREE.Color(0x0a1622);
  mScene.fog=new THREE.Fog(0x0a1622,9,22);

  mCam=new THREE.PerspectiveCamera(50,el.clientWidth/el.clientHeight,0.1,100);
  mCam.position.set(0,3.2,7.5);

  mRenderer=new THREE.WebGLRenderer({antialias:true});
  mRenderer.setSize(el.clientWidth,el.clientHeight);
  mRenderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  mRenderer.toneMapping=THREE.ACESFilmicToneMapping;
  mRenderer.shadowMap.enabled=true;
  mRenderer.shadowMap.type=THREE.PCFSoftShadowMap;
  el.appendChild(mRenderer.domElement);

  // 环境反射
  try{
    const pmrem=new THREE.PMREMGenerator(mRenderer);
    mEnvMap=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
    mScene.environment=mEnvMap;
  }catch(e){}

  // 环境光
  mScene.add(new THREE.AmbientLight(0x3a5a7a,0.55));

  // 地板（仿大理石）
  const floorMat=new THREE.MeshStandardMaterial({color:0x1a2632,roughness:0.35,metalness:0.25,envMap:mEnvMap,envMapIntensity:0.4});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,10),floorMat);
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-1.5;
  floor.receiveShadow=true;
  mScene.add(floor);
  // 地面装饰圈（中央展位）
  const ringMat=new THREE.MeshStandardMaterial({color:0x2a3a4a,roughness:0.4,metalness:0.4,envMap:mEnvMap,envMapIntensity:0.5});
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.8,64),ringMat);
  ring.rotation.x=-Math.PI/2;
  ring.position.y=-1.49;
  mScene.add(ring);

  // 四面墙
  const wallMat=new THREE.MeshStandardMaterial({color:0x121c26,roughness:0.92});
  const backWall=new THREE.Mesh(new THREE.PlaneGeometry(14,6),wallMat);
  backWall.position.set(0,1.5,-5);backWall.receiveShadow=true;
  mScene.add(backWall);
  const leftWall=new THREE.Mesh(new THREE.PlaneGeometry(10,6),wallMat);
  leftWall.rotation.y=Math.PI/2;leftWall.position.set(-7,1.5,0);leftWall.receiveShadow=true;
  mScene.add(leftWall);
  const rightWall=new THREE.Mesh(new THREE.PlaneGeometry(10,6),wallMat);
  rightWall.rotation.y=-Math.PI/2;rightWall.position.set(7,1.5,0);rightWall.receiveShadow=true;
  mScene.add(rightWall);
  // 天花板
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(14,10),new THREE.MeshStandardMaterial({color:0x0c1620,roughness:1}));
  ceil.rotation.x=Math.PI/2;ceil.position.y=4.5;
  mScene.add(ceil);
  // 顶部柔光带
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(10,0.3),new THREE.MeshStandardMaterial({color:0xfff0d0,emissive:0xfff0d0,emissiveIntensity:0.6}));
  strip.rotation.x=Math.PI/2;strip.position.set(0,4.45,0);
  mScene.add(strip);

  // 中央展台 · 镇馆之宝
  mGroup=new THREE.Group();
  const centerPed=new THREE.Mesh(
    new THREE.CylinderGeometry(1.25,1.45,0.5,48),
    new THREE.MeshStandardMaterial({color:0x2a3a4a,metalness:0.55,roughness:0.35,envMap:mEnvMap,envMapIntensity:0.6})
  );
  centerPed.position.y=-1.25;centerPed.castShadow=true;centerPed.receiveShadow=true;
  mGroup.add(centerPed);
  const starItem=MUSEUM_COLLECTION[0];
  const starVase=new THREE.Mesh(
    new THREE.LatheGeometry(buildVesselGeometry(starItem.vessel),72),
    new THREE.MeshPhysicalMaterial({color:0xf0ead8,roughness:0.18,metalness:0.05,clearcoat:1,clearcoatRoughness:0.06,envMap:mEnvMap,envMapIntensity:0.9,emissive:0xc9a961,emissiveIntensity:0.1})
  );
  starVase.position.y=-0.2;starVase.castShadow=true;
  starVase.userData={id:starItem.id};
  mGroup.add(starVase);
  // 镇馆之宝标签
  const starLabel=makeLabelSprite('★ 镇馆之宝 · '+starItem.name);
  starLabel.position.set(0,1.3,0);
  mGroup.add(starLabel);
  // 中央射灯
  const starLight=new THREE.SpotLight(0xfff0d0,3,9,Math.PI/7,0.45,1.5);
  starLight.position.set(0,4,0);starLight.target=starVase;starLight.castShadow=true;
  starLight.shadow.mapSize.set(512,512);
  mScene.add(starLight);

  // 沿墙展柜
  mCases=[];
  const wallItems=MUSEUM_COLLECTION.slice(1);
  const positions=[
    {x:-4,z:-4.4,ry:0},{x:0,z:-4.4,ry:0},{x:4,z:-4.4,ry:0},
    {x:-6.5,z:-1.2,ry:Math.PI/2},{x:-6.5,z:2,ry:Math.PI/2},
    {x:6.5,z:-1.2,ry:-Math.PI/2},{x:6.5,z:2,ry:-Math.PI/2}
  ];
  wallItems.forEach((item,i)=>{
    const pos=positions[i];if(!pos)return;
    const grp=new THREE.Group();
    grp.position.set(pos.x,0,pos.z);grp.rotation.y=pos.ry;
    // 展台底座
    const ped=new THREE.Mesh(
      new THREE.CylinderGeometry(0.55,0.65,0.8,32),
      new THREE.MeshStandardMaterial({color:0x2a3a4a,metalness:0.45,roughness:0.45,envMap:mEnvMap,envMapIntensity:0.5})
    );
    ped.position.y=-1.1;ped.castShadow=true;ped.receiveShadow=true;
    grp.add(ped);
    // 玻璃罩
    const glass=new THREE.Mesh(
      new THREE.CylinderGeometry(0.62,0.62,1.6,32,1,true),
      new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0.05,metalness:0,clearcoat:1,transparent:true,opacity:0.16,transmission:0.88,envMap:mEnvMap,envMapIntensity:1.2,side:THREE.DoubleSide})
    );
    glass.position.y=0.15;grp.add(glass);
    // 藏品瓷坯
    const vase=new THREE.Mesh(
      new THREE.LatheGeometry(buildVesselGeometry(item.vessel),48),
      new THREE.MeshPhysicalMaterial({color:item.color,roughness:0.22,metalness:0.1,clearcoat:0.9,clearcoatRoughness:0.12,envMap:mEnvMap,envMapIntensity:0.75})
    );
    vase.position.y=-0.15;vase.scale.setScalar(0.85);vase.castShadow=true;
    vase.userData={id:item.id};
    grp.add(vase);
    // 标签牌
    const label=makeLabelSprite(item.name);
    label.position.set(0,-1.55,0.35);
    grp.add(label);
    // 射灯
    const sl=new THREE.SpotLight(0xfff5e0,1.6,6,Math.PI/6,0.5,1.5);
    sl.position.set(0,3,0.5);sl.target=vase;sl.castShadow=true;
    sl.shadow.mapSize.set(256,256);
    mScene.add(sl);
    mGroup.add(grp);
    mCases.push({group:grp,item,vase,glass});
  });
  mScene.add(mGroup);

  // 墙面照片展板（醴陵博物馆实景）
  mTexLoader=new THREE.TextureLoader();
  const photoConf=[
    {img:'lilingbowuguan.jpg',x:0,y:2.9,z:-4.85,w:3.4,h:2.1},
    {img:'liling1.jpg',x:-5.6,y:2.6,z:-4.85,w:2.2,h:1.5},
    {img:'liling4.jpg',x:5.6,y:2.6,z:-4.85,w:2.2,h:1.5}
  ];
  photoConf.forEach(c=>{
    const tex=mTexLoader.load('纹样wy/images/'+c.img);
    tex.colorSpace=THREE.SRGBColorSpace;
    // 画框
    const frame=new THREE.Mesh(
      new THREE.PlaneGeometry(c.w+0.18,c.h+0.18),
      new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:0.5,metalness:0.3})
    );
    frame.position.set(c.x,c.y,c.z-0.01);mScene.add(frame);
    const photo=new THREE.Mesh(
      new THREE.PlaneGeometry(c.w,c.h),
      new THREE.MeshStandardMaterial({map:tex,roughness:0.55,metalness:0,emissive:0x222222,emissiveIntensity:0.15})
    );
    photo.position.set(c.x,c.y,c.z);mScene.add(photo);
  });

  // 控制器
  mCtrl=new OrbitControls(mCam,mRenderer.domElement);
  mCtrl.enableDamping=true;
  mCtrl.autoRotate=true;
  mCtrl.autoRotateSpeed=0.5;
  mCtrl.minDistance=4;
  mCtrl.maxDistance=12;
  mCtrl.maxPolarAngle=Math.PI/2.05;
  mCtrl.minPolarAngle=Math.PI/5;
  mCtrl.enablePan=false;
  mCtrl.target.set(0,0,0);

  // 点击交互
  mRaycaster=new THREE.Raycaster();
  mPointer=new THREE.Vector2();
  mRenderer.domElement.addEventListener('click',onMuseumClick);

  // resize
  window.addEventListener('resize',()=>{
    if(!mRenderer)return;
    mCam.aspect=el.clientWidth/el.clientHeight;
    mCam.updateProjectionMatrix();
    mRenderer.setSize(el.clientWidth,el.clientHeight);
  });

  function museumLoop(){
    requestAnimationFrame(museumLoop);
    mCtrl.update();
    mRenderer.render(mScene,mCam);
  }
  museumLoop();

  // 默认选中镇馆之宝
  selectMuseumItem(MUSEUM_COLLECTION[0].id);
}

function onMuseumClick(e){
  const el=document.getElementById('museum3d');
  const rect=el.getBoundingClientRect();
  mPointer.x=((e.clientX-rect.left)/rect.width)*2-1;
  mPointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  mRaycaster.setFromCamera(mPointer,mCam);
  const targets=[];
  mGroup.traverse(o=>{if(o.isMesh&&o.userData&&o.userData.id)targets.push(o);});
  const hits=mRaycaster.intersectObjects(targets,false);
  if(hits.length){
    const id=hits[0].object.userData.id;
    selectMuseumItem(id);
  }
}

function selectMuseumItem(id){
  mActiveId=id;
  const item=MUSEUM_COLLECTION.find(x=>x.id===id);
  if(!item)return;
  // 渲染详情面板
  const photoPath='纹样wy/images/'+item.photo;
  const photoEnc=photoPath.split('/').map(encodeURIComponent).join('/');
  document.getElementById('museumDetail').innerHTML=
    '<div class="md-head">'+
      '<img class="md-photo" src="'+photoEnc+'" alt="'+item.name+'" onerror="this.style.opacity=\'0.15\'">'+
      '<div><div class="md-title">'+item.name+(item.id==='bian'?' <span class="mt-star">镇馆</span>':'')+'</div>'+
      '<div class="md-era">'+item.era+'</div>'+
      '<div class="md-grade">'+item.grade+'</div>'+
      '<div class="md-meta"><b>器型：</b>'+item.vessel+'　<b>纹样：</b>'+item.motif+'<br><b>尺寸：</b>'+item.size+'</div>'+
      '</div></div>'+
    '<div class="md-desc">'+item.desc+'</div>';
  // 高亮缩略图
  document.querySelectorAll('.museum-thumb').forEach(t=>t.classList.toggle('active',t.dataset.id===id));
  // 高亮3D展品（发光 + 微缩放）
  mCases.forEach(c=>{
    const isActive=c.item.id===id;
    c.vase.material.emissive.setHex(isActive?0xc9a961:0x000000);
    c.vase.material.emissiveIntensity=isActive?0.3:0;
    c.vase.scale.setScalar(isActive?0.95:0.85);
  });
}

function renderMuseumUI(){
  const cats=['全部',...Array.from(new Set(MUSEUM_COLLECTION.map(c=>c.cat)))];
  document.getElementById('museumTabs').innerHTML=cats.map((c,i)=>
    '<span class="museum-tab'+(i===0?' active':'')+'" data-cat="'+c+'" onclick="filterMuseum(\''+c+'\')">'+c+'</span>').join('');
  document.getElementById('museumThumbs').innerHTML=MUSEUM_COLLECTION.map(c=>{
    const p=('纹样wy/images/'+c.photo).split('/').map(encodeURIComponent).join('/');
    return '<div class="museum-thumb'+(c.id==='bian'?' active':'')+'" data-id="'+c.id+'" onclick="selectMuseumItem(\''+c.id+'\')">'+
      '<img src="'+p+'" alt="'+c.name+'" loading="lazy" onerror="this.style.opacity=\'0.15\'">'+
      '<div class="mt-name">'+c.name+'</div>'+(c.id==='bian'?'<div class="mt-star">镇馆</div>':'')+'</div>';
  }).join('');
}

window.filterMuseum=function(cat){
  document.querySelectorAll('.museum-tab').forEach(t=>t.classList.toggle('active',t.dataset.cat===cat));
  document.querySelectorAll('.museum-thumb').forEach(t=>{
    const item=MUSEUM_COLLECTION.find(c=>c.id===t.dataset.id);
    t.style.display=(cat==='全部'||item.cat===cat)?'':'none';
  });
};

window.selectMuseumItem=selectMuseumItem;

window.__museum={initMuseum};

// ============ RENDER STATIC SECTIONS ============
function renderStatic(){
  // class
  document.getElementById('classGrid').innerHTML=CLASS_DATA.map(c=>`
    <div class="class-card"><div class="num">${c.num}</div><h4>${c.title}</h4><p>${c.desc}</p></div>`).join('');
  // tech
  document.getElementById('techGrid').innerHTML=TECH_DATA.map(t=>`
    <div class="tech-card"><div class="num">${t.num}</div><h4>${t.title}</h4><p>${t.desc}</p></div>`).join('');
  document.getElementById('platformGrid').innerHTML=PLATFORM_DATA.map(p=>`
    <div class="platform-card"><div class="icon">${p.icon}</div><h4>${p.title}</h4><p>${p.desc}</p></div>`).join('');
  document.getElementById('scenarioGrid').innerHTML=SCENARIO_DATA.map(s=>`
    <div class="scenario-card"><div class="num">${s.num}</div><h4>${s.title}</h4><p>${s.desc}</p></div>`).join('');
  document.getElementById('advGrid').innerHTML=ADV_DATA.map(a=>`
    <div class="adv-card"><h4>${a.title}</h4><p>${a.desc}</p></div>`).join('');
  document.getElementById('ecoGrid').innerHTML=ECO_DATA.map(e=>`
    <div class="eco-card"><div class="icon">${e.icon}</div><h4>${e.title}</h4><p>${e.desc}</p></div>`).join('');
  // showcase
  document.getElementById('showcaseGrid').innerHTML=SHOWCASE_DATA.map((s,i)=>`
    <div class="showcase-card" onclick="loadShowcase(${i})">
      <div class="thumb">${buildSVG(200,200,{motif:s.motif,scheme:s.scheme,layout:['满地','开光','散点','边饰'][i%4],density:60})}</div>
      <div class="label">${s.label}</div>
    </div>`).join('');
  // 博物馆藏品分类标签与缩略图
  try{renderMuseumUI();}catch(e){console.warn('museumUI',e);}
  // 纹样库由 /api/patterns 动态加载，见 loadLibrary()
}

// ============ CHIPS ============
function renderChips(){
  const mk=(id,arr,val,prop)=>document.getElementById(id).innerHTML=arr.map(s=>
    `<span class="chip ${s===val?'active':''}" onclick="selectChip('${prop}','${s}')">${s}</span>`).join('');
  mk('styleChips',STYLES,state.style,'style');
  mk('motifChips',MOTIFS,state.motif,'motif');
  mk('layoutChips',LAYOUTS,state.layout,'layout');
  mk('vesselChips',VESSELS,state.vessel,'vessel');
  mk('colorChips',Object.keys(COLOR_SCHEMES),state.scheme,'scheme');
  // vessel select (preview)
  document.getElementById('vesselSelect').innerHTML=VESSELS.map(v=>
    `<span class="chip ${v===state.vessel?'active':''}" onclick="selectChip('vessel','${v}')">${v}</span>`).join('');
  // 同步自定义颜色块显隐（renderChips 内统一处理，避免多处遗漏）
  if(typeof syncCustomColorBlock==='function') syncCustomColorBlock();
}

// ============ LIBRARY（动态：扫描本地纹样wy 文件夹） ============
let ALL_PATTERNS=[];
let PATTERN_PAGE=0;
const PAGE_SIZE=24;

// 由纹样名推导母题（供 AI 提示词）
function deriveMotif(name){
  const n=name;
  if(/缠枝|莲|荷/.test(n)) return '缠枝莲';
  if(/牡丹|宝相|团花/.test(n)) return '牡丹';
  if(/龙/.test(n)) return '龙纹';
  if(/凤/.test(n)) return '凤纹';
  if(/麒麟|瑞兽|兽|螭|狮/.test(n)) return '麒麟';
  if(/蝙蝠|五福|五蝠/.test(n)) return '蝙蝠';
  if(/寿/.test(n)) return '寿桃';
  if(/福|八宝|吉祥/.test(n)) return '吉语字';
  if(/葡萄/.test(n)) return '葡萄';
  if(/葫芦/.test(n)) return '葫芦';
  if(/婴/.test(n)) return '婴戏';
  if(/海水|江崖/.test(n)) return '海水江崖';
  if(/梅/.test(n)) return '梅枝';
  if(/菊/.test(n)) return '菊花';
  if(/山水/.test(n)) return '山水';
  if(/云/.test(n)) return '如意云';
  if(/回纹|几何/.test(n)) return '回纹';
  return '缠枝莲';
}
// 由纹样名推导配色方案
function deriveScheme(name){
  const n=name;
  if(/粉彩/.test(n)) return '粉彩牡丹';
  if(/红金|描金/.test(n)) return '红金缠枝';
  if(/墨|素雅/.test(n)) return '墨白素雅';
  if(/青绿/.test(n)) return '青绿设色';
  return '经典青花';
}

async function loadLibrary(){
  const grid=document.getElementById('patternGrid');
  const count=document.getElementById('libCount');
  grid.innerHTML='<div class="lib-loading" style="grid-column:1/-1">正在扫描本地纹样素材…</div>';
  count.textContent='加载中…';
  try{
    const res=await fetch('/api/patterns');
    const data=await res.json();
    ALL_PATTERNS=data.patterns||[];
    // 填充分类下拉
    const cats=['全部',...data.categories];
    document.getElementById('catFilter').innerHTML=cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    PATTERN_PAGE=0;
    renderLibrary();
    renderFeed();   // 纹样库就绪后渲染短视频卡片
  }catch(e){
    grid.innerHTML='<div class="lib-loading" style="grid-column:1/-1">纹样素材加载失败：'+e.message+'</div>';
  }
}

window.resetAndRender=function(){
  PATTERN_PAGE=0;
  renderLibrary();
};

window.renderLibrary=function(append){
  const grid=document.getElementById('patternGrid');
  const count=document.getElementById('libCount');
  const cat=document.getElementById('catFilter').value;
  const q=(document.getElementById('libSearch').value||'').trim().toLowerCase();
  let list=ALL_PATTERNS.filter(p=>
    (cat==='全部'||p.category===cat)&&
    (!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))
  );
  if(!append) PATTERN_PAGE=0;
  const shown=Math.min((PATTERN_PAGE+1)*PAGE_SIZE,list.length);
  const slice=list.slice(0,shown);
  grid.innerHTML=slice.map((p)=>{
    const idx=ALL_PATTERNS.indexOf(p);
    const src=p.path.split('/').map(encodeURIComponent).join('/'); // 逐段编码，兼容空格/括号/中文
    const sub=p.subcategory?'<span class="sub-tag">'+p.subcategory+'</span>':'';
    return `<div class="pattern-card" onclick="loadFromLibrary(${idx})">
      <div class="pattern-thumb"><img src="${src}" loading="lazy" alt="${p.name}" onerror="this.parentElement.style.display='none'"></div>
      <div class="pattern-info">
        <h4>${p.name}</h4>
        <div class="meta">${sub}${p.category}</div>
        <div class="pattern-stats"><span>📁 素材</span></div>
        <button class="gen-btn" onclick="event.stopPropagation();loadFromLibrary(${idx})">以此生成 →</button>
      </div>
    </div>`;
  }).join('');
  count.innerHTML=`共 <b>${list.length}</b> 款 · 显示 <b>${slice.length}</b>`;
  document.getElementById('loadMoreWrap').style.display=shown<list.length?'block':'none';
  PATTERN_PAGE++;
}

window.loadFromLibrary=function(idx){
  const p=ALL_PATTERNS[idx];
  if(!p) return;
  state.motif=p.motif||deriveMotif(p.name);
  state.scheme=deriveScheme(p.name);
  state.style='青花瓷';
  state.refName=p.name;          // 让 AI 提示词参考纹样名
  state.aiImageUrl=null;state.dyedCanvas=null;
  renderChips();
  generatePattern();
  document.getElementById('agent').scrollIntoView({behavior:'smooth'});
  showToast('已载入「'+p.name+'」，正在调用 AI 再创作…');
  setTimeout(()=>aiGenerate(),300);
};

// ============ HERO CANVAS (floating pattern) ============
function initHeroCanvas(){
  const c=document.getElementById('heroCanvas');
  const ctx=c.getContext('2d');
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  const particles=[];
  for(let i=0;i<30;i++){
    particles.push({x:Math.random()*c.width,y:Math.random()*c.height,
      r:20+Math.random()*40,vy:0.2+Math.random()*0.5,
      type:Math.floor(Math.random()*4),rot:Math.random()*Math.PI*2,vr:(Math.random()-0.5)*0.01});
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    particles.forEach(p=>{
      p.y-=p.vy;p.rot+=p.vr;
      if(p.y<-60){p.y=c.height+60;p.x=Math.random()*c.width;}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=0.12;
      ctx.strokeStyle='#1e4d8c';ctx.lineWidth=2;
      // simple flower
      for(let k=0;k<6;k++){
        ctx.beginPath();
        ctx.ellipse(0,p.r*0.5,p.r*0.3,p.r*0.15,0,0,Math.PI*2);
        ctx.rotate(Math.PI/3);
        ctx.stroke();
      }
      ctx.beginPath();ctx.arc(0,0,p.r*0.2,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ============ NAV SCROLL ============
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>30);
});

// expose functions
window.fillExample=function(el){document.getElementById('reqInput').value=el.textContent;};
// 从纹样库（ALL_PATTERNS）查找与母题匹配的真实纹样，返回纹样名作为 AI 二次创作参考
function findRefFromLibrary(motif){
  if(!ALL_PATTERNS||!ALL_PATTERNS.length) return null;
  const matches=ALL_PATTERNS.filter(p=>(p.motif&&p.motif===motif)||deriveMotif(p.name)===motif);
  if(!matches.length) return null;
  // 随机取一条，增加二次创作的多样性
  const pick=matches[Math.floor(Math.random()*matches.length)];
  return pick.name;
}

window.selectChip=function(prop,val){
  state[prop]=val;
  // 切换器型/配色时保留 AI 纹样（仅重新贴合/重新染色，无需重新生成）；其余参数变化需重新生成
  if(prop!=='vessel'&&prop!=='scheme'){state.aiImageUrl=null;state.dyedCanvas=null;}
  // 选择母题纹样：自动从纹样库匹配真实纹样作为参考，进行 AI 二次创作
  if(prop==='motif'){
    const ref=findRefFromLibrary(val);
    state.refName=ref;   // 关联纹样库真实纹样（buildPrompt 会据此构建"参考传统纹样再创作"提示词）
    renderChips();
    generatePattern();
    if(ref){
      showToast('已关联纹样库「'+ref+'」，正根据此纹样 AI 二次创作…');
      setTimeout(()=>aiGenerate(),200);
    }else{
      showToast('纹样库暂无「'+val+'」母题参考纹样，可手动点 AI 生成');
    }
    return;
  }
  // 选择风格：若尚未关联纹样库参考，按当前母题补关联
  if(prop==='style'){
    if(!state.refName){state.refName=findRefFromLibrary(state.motif);}
    renderChips();generatePattern();
    return;
  }
  renderChips();
  if(prop==='scheme'){
    // 配色变更：纹样保留，重新染色缓存后更新器型与 2D
    state.dyedCanvas=null;  // 配色变了，旧染色失效
    rebuildDyedCanvas().then(()=>{
      if(window.__scene) window.__scene.updateVessel();
      if(state.view==='2d') draw2DPattern();
    });
  }else if(prop==='vessel'){
    // 器型变更：复用染色缓存同步贴合（纹样立即覆盖新模具表面）
    if(window.__scene) window.__scene.updateVessel();
  }else{
    generatePattern();
  }
};
// 自定义颜色：实时改写「自定义配色」方案的对应色，并重新染色贴合（不重新生成纹样）
window.setCustomColor=function(key,hex){
  COLOR_SCHEMES['自定义配色'][key]=hex;
  if(state.scheme!=='自定义配色'){state.scheme='自定义配色';renderChips();syncCustomColorBlock();}
  state.dyedCanvas=null;  // 配色变了，重新染色
  rebuildDyedCanvas().then(()=>{
    if(window.__scene&&window.__scene.updateVessel) window.__scene.updateVessel();
    if(state.view==='2d') draw2DPattern();
  });
};
const CUSTOM_DEFAULTS={body:'#f4f1ea',main:'#1e4d8c',sub:'#4a7ab5',accent:'#c9a961',line:'#0f2a43'};
window.resetCustomColor=function(){
  Object.assign(COLOR_SCHEMES['自定义配色'],CUSTOM_DEFAULTS);
  document.getElementById('customMain').value=CUSTOM_DEFAULTS.main;
  document.getElementById('customBody').value=CUSTOM_DEFAULTS.body;
  document.getElementById('customAccent').value=CUSTOM_DEFAULTS.accent;
  state.dyedCanvas=null;
  rebuildDyedCanvas().then(()=>{
    if(window.__scene&&window.__scene.updateVessel) window.__scene.updateVessel();
    if(state.view==='2d') draw2DPattern();
  });
  showToast('已恢复默认自定义配色');
};
// 同步自定义颜色块的显示与拾取器初值
function syncCustomColorBlock(){
  const block=document.getElementById('customColorBlock');
  if(!block) return;
  const show=state.scheme==='自定义配色';
  block.style.display=show?'block':'none';
  if(show){
    const c=COLOR_SCHEMES['自定义配色'];
    document.getElementById('customMain').value=c.main;
    document.getElementById('customBody').value=c.body;
    document.getElementById('customAccent').value=c.accent;
  }
}
window.updateDensity=function(){
  state.density=+document.getElementById('densitySlider').value;
  document.getElementById('densityVal').textContent=state.density;
  state.refName=null;state.aiImageUrl=null;state.dyedCanvas=null;
};
window.toggleLayer=function(key){
  state.layers[key]=!state.layers[key];
  generatePattern();
};
window.switchView=function(v,el){
  state.view=v;
  document.querySelectorAll('.view-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const stage=document.getElementById('threeStage');
  const canvas=document.getElementById('patternCanvas');
  if(v==='3d'){
    stage.style.display='block';canvas.style.display='none';
  } else {
    stage.style.display='none';canvas.style.display='block';
    draw2DPattern();
  }
};
window.toggleAutoRot=()=>window.__scene.toggleAutoRot();
window.resetView=()=>window.__scene.resetView();
window.loadShowcase=function(idx){
  const s=SHOWCASE_DATA[idx];
  state.motif=s.motif;state.scheme=s.scheme;
  renderChips();generatePattern();
  document.getElementById('agent').scrollIntoView({behavior:'smooth'});
};

// ============ PARSE REQUIREMENT ============
window.parseRequirement=function(){
  const btn=document.getElementById('parseBtn');
  const txt=document.getElementById('reqInput').value;
  btn.disabled=true;btn.textContent='解析中...';
  // simulate parsing
  setTimeout(()=>{
    // keyword matching
    const has=(kw)=>txt.includes(kw);
    if(has('青花'))state.style='青花瓷';
    else if(has('粉彩'))state.style='粉彩';
    else if(has('釉下五彩'))state.style='釉下五彩';
    else if(has('现代')||has('简约')||has('几何'))state.style='现代简约';
    // motif
    const foundMotif=MOTIFS.find(m=>has(m.split('')[0])&&txt.includes(m))||MOTIFS.find(m=>txt.includes(m));
    if(foundMotif) state.motif=foundMotif;
    if(has('海水')||has('江崖'))state.motif='海水江崖';
    if(has('冰裂')||has('开片'))state.motif='冰裂纹';
    if(has('回纹')||has('几何'))state.motif='回纹';
    // layout
    if(has('满工')||has('繁密')||has('繁满')||has('满地'))state.layout='满地';
    else if(has('开光'))state.layout='开光';
    else if(has('散点')||has('疏朗')||has('留白'))state.layout='散点';
    else if(has('边饰'))state.layout='边饰';
    // vessel
    if(has('花瓶')||has('梅瓶'))state.vessel='花瓶';
    else if(has('茶具'))state.vessel='茶具';
    else if(has('瓷盘')||has('盘'))state.vessel='瓷盘';
    else if(has('瓷砖')||has('砖'))state.vessel='瓷砖';
    else if(has('装饰画')||has('方幅'))state.vessel='方幅';
    // scheme
    if(has('红金'))state.scheme='红金缠枝';
    else if(has('描金'))state.scheme='青花描金';
    else if(has('粉彩'))state.scheme='粉彩牡丹';
    else if(has('墨白')||has('素雅'))state.scheme='墨白素雅';
    else if(has('青绿'))state.scheme='青绿设色';
    else if(has('釉下五彩'))state.scheme='釉下五彩';
    else if(state.style==='青花瓷')state.scheme='经典青花';
    // density
    if(has('繁密')||has('繁满')||has('满工'))state.density=85;
    else if(has('疏朗')||has('留白'))state.density=35;
    else state.density=55;
    document.getElementById('densitySlider').value=state.density;
    document.getElementById('densityVal').textContent=state.density;
    state.refName=null;   // 手动解析需求时清除纹样库参考
    renderChips();
    generatePattern();
    btn.disabled=false;btn.textContent='智能解析需求';
    showToast('解析完成，正在调用 AI 生图…');
    // 解析完成后自动调用 AI 生图
    setTimeout(()=>aiGenerate(),200);
  },700);
};

window.randomize=function(){
  state.motif=MOTIFS[Math.floor(Math.random()*MOTIFS.length)];
  state.scheme=Object.keys(COLOR_SCHEMES).filter(k=>k!=='自定义配色')[Math.floor(Math.random()*(Object.keys(COLOR_SCHEMES).length-1))];
  state.layout=LAYOUTS[Math.floor(Math.random()*LAYOUTS.length)];
  state.density=30+Math.floor(Math.random()*60);
  state.aiImageUrl=null;state.dyedCanvas=null;
  state.refName=null;
  document.getElementById('densitySlider').value=state.density;
  document.getElementById('densityVal').textContent=state.density;
  renderChips();
  generatePattern();
  showToast('参数已随机，正在调用 AI 生图…');
  setTimeout(()=>aiGenerate(),200);
};

// ============ GENERATE PATTERN ============
window.generatePattern=function(){
  if(state.view==='2d') draw2DPattern();
  if(window.__scene&&window.__scene.updateVessel) window.__scene.updateVessel();
};

function draw2DPattern(){
  const canvas=document.getElementById('patternCanvas');
  const ctx=canvas.getContext('2d');
  const w=canvas.width=canvas.clientWidth*2;
  const h=canvas.height=canvas.clientHeight*2;
  ctx.clearRect(0,0,w,h);
  const colors=COLOR_SCHEMES[state.scheme];
  const src=state.aiImageUrl?('/api/image?url='+encodeURIComponent(state.aiImageUrl)):svgToDataURL(buildSVG(512,512));
  // 与 3D 一致：黑白线描按当前配色染色后显示
  tintPatternCanvas(src,colors.main,colors.body).then(c=>{
    ctx.drawImage(c,0,0,w,h);
  }).catch(()=>{
    const svg=buildSVG(w,h);const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,w,h);img.src=svgToDataURL(svg);
  });
}

// ============ AI 生图（硅基流动） ============
// 根据当前参数构建陶瓷纹样提示词（生成黑白线描底稿，颜色后期由用户搭配）
function buildPrompt(){
  const s=state;
  const densityDesc=s.density>70?'繁密满工':(s.density<40?'疏朗留白':'疏密适中');
  const styleDesc={
    '青花瓷':'中国传统青花瓷',
    '粉彩':'中国粉彩瓷',
    '釉下五彩':'醴陵釉下五彩瓷',
    '现代简约':'现代简约国潮陶瓷'
  }[s.style]||'中国传统陶瓷';
  const layoutDesc={
    '满地':'满地铺满，纹样均匀布满整个画面边缘到边缘',
    '开光':'开光构图，框内绘主纹，框外填满辅助缠枝纹样不留白',
    '散点':'散点构图，纹样单元均匀重复布满画面',
    '边饰':'边饰构图，纹样环绕边缘并填满中心'
  }[s.layout]||'满地铺满';
  const motifClause=s.refName?`参考传统纹样「${s.refName}」的构图与母题进行再创作，保留其主纹元素`:`${s.motif}母题`;
  const prompt=`中国传统陶瓷纹样黑白线描底稿，黑色细线绘制于纯白底色，纯线条无任何色彩填充，单色墨线线稿留待后期上色，无缝连续可平铺拼接，${styleDesc}风格，${motifClause}，${layoutDesc}，${densityDesc}，平面2D图案纹样本身非器物造型，只画纹样图案本身绝对不画任何器物器型花瓶碗盘罐壶陶瓷物件，图案铺满整个方形画布从边缘到边缘均匀分布无大面积留白，左右边缘可无缝对接平铺，纯平面展开图无透视无阴影，高清矢量线稿质感，非遗传统工艺，对称均衡`;
  const negative='color, colored, colors, filled, fill, painting, red, blue, green, yellow, pink, purple, gradient, grayscale shading, photograph, 3d render, perspective, shadow, blurry, low quality, watermark, text, logo, blank margins, empty space, frame, border, messy, distorted, vessel, vase, bottle, pot, jar, bowl, plate, cup, ceramic object, 3d object, product photo';
  return {prompt,negative};
}

window.aiGenerate=async function(){
  if(state.aiBusy) return;
  const btn=document.getElementById('aiGenBtn');
  const overlay=document.getElementById('aiLoading');
  const loadingText=document.getElementById('aiLoadingText');
  btn.disabled=true;btn.querySelector('.ai-gen-text').style.display='none';
  btn.querySelector('.ai-gen-loading').style.display='inline-flex';
  state.aiBusy=true;
  overlay.style.display='flex';
  loadingText.textContent='AI 正在创作纹样…';
  
  // 更新当前模型选择
  const sel=document.getElementById('modelSelect');
  if(sel&&sel.value) state.aiModel=sel.value;
  
  const {prompt,negative}=buildPrompt();
  const body={
    model:state.aiModel,
    prompt,
    negative_prompt:negative,
    image_size:'1024x1024'
  };
  try{
    const res=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||data.detail||('HTTP '+res.status));
    const imgUrl=data.images&&data.images[0]&&(data.images[0].url||data.images[0].b64_json);
    if(!imgUrl) throw new Error('未返回图像');
    // 若为 base64，转 data URL；否则存原始 URL（经代理加载）
    if(imgUrl.startsWith('http')){
      state.aiImageUrl=imgUrl;
    }else if(imgUrl.startsWith('data:')||/^[A-Za-z0-9+/=]+$/.test(imgUrl)){
      state.aiImageUrl=imgUrl.startsWith('data:')?imgUrl:('data:image/png;base64,'+imgUrl);
    }else{
      state.aiImageUrl=imgUrl;
    }
    // 更新预览：先染色缓存，再更新器型（之后切换器型即可同步复用，纹样立即贴合）
    rebuildDyedCanvas().then(()=>{
      if(state.view==='2d') draw2DPattern();
      if(window.__scene&&window.__scene.updateVessel) window.__scene.updateVessel();
    });
    showToast('AI 生图完成，纹样已贴附到 3D 瓷器');
    // 创作记录
    if(currentUserName()){
      recordCreation({
        targetId:'creation_'+Date.now(),
        title:(state.motif||'纹样')+' · '+(state.style||'传统'),
        sub:(state.vessel||'花瓶')+'器型'+(state.scheme?(' · 配色'+state.scheme:''),
        thumb:state.aiImageUrl
      });
      // 模拟被赞（创作被瓷友欣赏）
      setTimeout(()=>{
        recordLikedBy({targetId:'crt_'+Date.now(),text:'你的创作「'+(state.motif||'纹样')+'」收到 1 个点赞',sub:'来自瓷友'});
      },5000);
    }
  }catch(err){
    console.error('AI生图失败',err);
    showToast('AI 生图失败：'+err.message+'（已用程序化纹样）');
    // 失败回退：清除 AI 图，使用 SVG
    state.aiImageUrl=null;state.dyedCanvas=null;
    if(state.view==='2d') draw2DPattern();
    if(window.__scene&&window.__scene.updateVessel) window.__scene.updateVessel();
  }finally{
    state.aiBusy=false;
    btn.disabled=false;
    btn.querySelector('.ai-gen-text').style.display='inline';
    btn.querySelector('.ai-gen-loading').style.display='none';
    overlay.style.display='none';
  }
};

// 加载模型列表
async function loadModels(){
  const sel=document.getElementById('modelSelect');
  try{
    const res=await fetch('/api/models',{method:'POST'});
    const data=await res.json();
    if(data.models){
      sel.innerHTML=data.models.map(m=>`<option value="${m.id}" ${m.id===data.default?'selected':''}>${m.name}</option>`).join('');
    }
  }catch(e){
    // 静默失败，使用默认
  }
}


// ============ DOWNLOAD ============
window.downloadSVG=function(){
  const svg=buildSVG(1024,1024);
  const blob=new Blob([svg],{type:'image/svg+xml'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`ciyun_${state.motif}_${Date.now()}.svg`;a.click();
  URL.revokeObjectURL(url);
  showToast('SVG 已下载');
};
window.downloadPNG=function(){
  const dl=(src)=>{
    const img=new Image();
    img.crossOrigin='anonymous';
    img.onload=()=>{
      const c=document.createElement('canvas');
      c.width=c.height=1024;
      c.getContext('2d').drawImage(img,0,0,1024,1024);
      c.toBlob(b=>{
        const a=document.createElement('a');
        a.href=URL.createObjectURL(b);
        a.download=`ciyun_${state.motif}_${Date.now()}.png`;a.click();
        URL.revokeObjectURL(a.href);
        showToast('PNG 已下载');
      });
    };
    img.onerror=()=>showToast('图片加载失败');
    img.src=src;
  };
  // 优先下载 AI 生图
  if(state.aiImageUrl){
    dl(state.aiImageUrl.startsWith('http')?('/api/image?url='+encodeURIComponent(state.aiImageUrl)):state.aiImageUrl);
  }else{
    const svg=buildSVG(1024,1024);
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement('canvas');
      c.width=c.height=1024;
      c.getContext('2d').drawImage(img,0,0,1024,1024);
      c.toBlob(b=>{
        const a=document.createElement('a');
        a.href=URL.createObjectURL(b);
        a.download=`ciyun_${state.motif}_${Date.now()}.png`;a.click();
        URL.revokeObjectURL(a.href);
        showToast('PNG 已下载');
      });
    };
    img.src=svgToDataURL(svg);
  }
};

// ============ COLLECTION ============
function thumbHTML(c){
  // 有 AI 图则显示图片，否则显示 SVG
  if(c.aiImageUrl){
    const src=c.aiImageUrl.startsWith('http')?('/api/image?url='+encodeURIComponent(c.aiImageUrl)):c.aiImageUrl;
    return `<img src="${src}" style="width:100%;height:100%;object-fit:cover" alt="${c.motif}">`;
  }
  return c.svg;
}
window.collectPattern=function(){
  const svg=buildSVG(256,256);
  state.collection.push({svg,svgFull:buildSVG(1024,1024),aiImageUrl:state.aiImageUrl,...state});
  renderCollection();
  renderForum();
  showToast('已收藏，可在论坛查看');
};
function renderCollection(){
  document.getElementById('collCount').textContent=state.collection.length;
  document.getElementById('collThumbs').innerHTML=state.collection.map((c,i)=>
    `<div class="coll-thumb" onclick="loadCollection(${i})" title="${c.motif}">${thumbHTML(c)}</div>`).join('');
}
window.loadCollection=function(i){
  const c=state.collection[i];
  Object.assign(state,{motif:c.motif,scheme:c.scheme,layout:c.layout,density:c.density,layers:{...c.layers},aiImageUrl:c.aiImageUrl});
  document.getElementById('densitySlider').value=state.density;
  document.getElementById('densityVal').textContent=state.density;
  renderChips();generatePattern();
  showToast('已载入收藏样纹');
};

// ============ FORUM ============
function renderForum(){
  const wall=document.getElementById('forumWall');
  if(state.collection.length===0){
    wall.innerHTML=`<div class="forum-empty"><div class="icon">🎨</div><p>还没有作品。去「瓷韵小匠 · 纹样生成智能体」生成并收藏你的第一幅样纹吧～</p><a href="#agent" class="btn btn-primary" style="margin-top:16px">去生成并分享</a></div>`;
    return;
  }
  wall.innerHTML=`<div class="forum-grid">${state.collection.map((c,i)=>`
    <div class="forum-card">
      <div class="thumb">${thumbHTML(c)}</div>
      <div class="body">
        <h4>${c.motif} · ${c.scheme}${c.aiImageUrl?' <span class="ai-badge">AI</span>':''}</h4>
        <div class="stats"><span>❤️ ${Math.floor(Math.random()*20)}</span><span>👁️ ${Math.floor(Math.random()*50)}</span><span>💬 0</span></div>
      </div>
    </div>`).join('')}</div>`;
}

// ============ TOAST ============
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'),2200);
}

// ============ 用户系统（localStorage 模拟，前端注册/登录） ============
const USERS_KEY='xcy_users', SESSION_KEY='xcy_session';
function getUsers(){return JSON.parse(localStorage.getItem(USERS_KEY)||'{}');}
function saveUsers(u){localStorage.setItem(USERS_KEY,JSON.stringify(u));}
function currentUserName(){return localStorage.getItem(SESSION_KEY);}
function currentUser(){const u=currentUserName();return u?getUsers()[u]:null;}
// 简易 hash（仅本地演示，非安全加密）
function hashPwd(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0;}return ''+h;}

window.openAuth=function(mode){
  document.getElementById('authMask').classList.add('show');
  switchAuth(mode);
};
window.closeAuth=function(){document.getElementById('authMask').classList.remove('show');};

// ============ 手机扫码访问 ============
let qrUrlCache='';
window.openQr=function(){
  const mask=document.getElementById('qrMask');
  const canvas=document.getElementById('qrCanvas');
  const urlEl=document.getElementById('qrUrl');
  mask.classList.add('show');
  canvas.innerHTML='<div class="qr-loading">正在生成二维码…</div>';
  urlEl.textContent='';
  fetch('/api/lan-url').then(r=>r.json()).then(d=>{
    const url=d.url||('http://'+location.hostname+':8123/');
    qrUrlCache=url;
    urlEl.textContent=url;
    canvas.innerHTML='';
    if(typeof QRCode!=='undefined'){
      new QRCode(canvas,{text:url,width:220,height:220,correctLevel:QRCode.CorrectLevel.M});
    }else{
      canvas.innerHTML='<div class="qr-fail">二维码库未加载，请复制下方网址到手机</div>';
    }
  }).catch(()=>{
    canvas.innerHTML='<div class="qr-fail">获取地址失败，请检查服务器是否运行</div>';
  });
};
window.closeQr=function(){document.getElementById('qrMask').classList.remove('show');};
window.copyQrUrl=function(){
  if(!qrUrlCache){showToast('暂无网址');return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(qrUrlCache).then(()=>showToast('网址已复制，发给好友扫码吧～'));
  }else{
    const ta=document.createElement('textarea');ta.value=qrUrlCache;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');showToast('网址已复制');}catch(e){showToast('复制失败，请手动复制');}
    document.body.removeChild(ta);
  }
};
// ============ 小瓷陶瓷问答 + 语音播报 ============
let xiaoAnswerCache='';
let xiaoVoicesReady=false;
// 预加载中文语音列表（部分浏览器异步加载）
if('speechSynthesis'in window){
  const loadV=()=>{if(window.speechSynthesis.getVoices().length)xiaoVoicesReady=true;};
  loadV();
  window.speechSynthesis.onvoiceschanged=loadV;
}
function pickZhVoice(){
  if(!('speechSynthesis'in window))return null;
  const vs=window.speechSynthesis.getVoices();
  if(!vs.length)return null;
  // 优先选中文女声（小瓷为女性助手形象）
  return vs.find(v=>/zh|cmn/i.test(v.lang)&&/female|女|ting|yaoyao|xiaoyi|yaoliebe/i.test(v.name))
      || vs.find(v=>/zh|cmn/i.test(v.lang))
      || null;
}
function speakXiaoci(text){
  if(!('speechSynthesis'in window)){showToast('当前浏览器不支持语音播报');return;}
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='zh-CN';u.rate=1;u.pitch=1.05;
  const v=pickZhVoice();if(v)u.voice=v;
  const playBtn=document.getElementById('xiaoPlayBtn');
  const stopBtn=document.getElementById('xiaoStopBtn');
  u.onstart=()=>{playBtn.classList.add('speaking');};
  u.onend=()=>{playBtn.classList.remove('speaking');};
  u.onerror=()=>{playBtn.classList.remove('speaking');};
  window.speechSynthesis.speak(u);
}
function stopXiaociVoice(){
  if('speechSynthesis'in window)window.speechSynthesis.cancel();
  document.getElementById('xiaoPlayBtn').classList.remove('speaking');
}
window.askXiaoci=async function(q){
  const question=(q||document.getElementById('xiaoInput').value||'').trim();
  if(!question){showToast('请输入陶瓷问题');return;}
  const ansEl=document.getElementById('xiaoAnswer');
  const playBtn=document.getElementById('xiaoPlayBtn');
  ansEl.textContent='小瓷思考中…';
  playBtn.disabled=true;playBtn.classList.remove('speaking');
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
    const d=await r.json();
    if(d.answer){
      ansEl.textContent=d.answer;
      xiaoAnswerCache=d.answer;
      playBtn.disabled=false;
      // 自动语音播报
      speakXiaoci(d.answer);
      showToast('小瓷已解答，正在语音播报');
    }else{
      ansEl.textContent='抱歉，小瓷暂时无法回答：'+(d.error||'未知错误');
    }
  }catch(e){
    ansEl.textContent='网络错误，请稍后重试';
  }
};
window.playXiaociVoice=function(){
  if(!xiaoAnswerCache){showToast('请先提问');return;}
  speakXiaoci(xiaoAnswerCache);
};

// ============ 个人中心数据层（按用户独立 localStorage 存储） ============
const REC_KEY='xcy_records_';
function getRecords(){
  const u=currentUserName();if(!u)return null;
  try{return JSON.parse(localStorage.getItem(REC_KEY+u)||'{}')}catch(e){return {}}
}
function getRec(){
  const r=getRecords()||{};
  ['likes','favs','comments','creations','views','likedBy'].forEach(k=>{if(!Array.isArray(r[k]))r[k]=[];});
  return r;
}
function saveRecords(r){const u=currentUserName();if(u)localStorage.setItem(REC_KEY+u,JSON.stringify(r));}
function _findIdx(arr,id){return arr.findIndex(x=>x.targetId===id);}
function recordLike(item){const r=getRec();const i=_findIdx(r.likes,item.targetId);if(i>=0){r.likes.splice(i,1);}else{r.likes.unshift(Object.assign({time:Date.now()},item));}saveRecords(r);}
function recordFav(item){const r=getRec();const i=_findIdx(r.favs,item.targetId);if(i>=0){r.favs.splice(i,1);}else{r.favs.unshift(Object.assign({time:Date.now()},item));}saveRecords(r);}
function recordComment(item){const r=getRec();r.comments.unshift(Object.assign({time:Date.now()},item));if(r.comments.length>50)r.comments.length=50;saveRecords(r);}
function recordCreation(item){const r=getRec();r.creations.unshift(Object.assign({time:Date.now()},item));if(r.creations.length>100)r.creations.length=100;saveRecords(r);}
function recordView(item){const r=getRec();const i=_findIdx(r.views,item.targetId);if(i>=0){r.views.splice(i,1);}r.views.unshift(Object.assign({time:Date.now()},item));if(r.views.length>100)r.views.length=100;saveRecords(r);}
function recordLikedBy(item){const r=getRec();r.likedBy.unshift(Object.assign({time:Date.now()},item));if(r.likedBy.length>100)r.likedBy.length=100;saveRecords(r);}

// ============ 个人中心 UI ============
let profileTab='likes';
function _esc(s){return (s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));}
function _fmtTime(ts){const d=new Date(ts);return d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
function _tabLabel(t){return {likes:'点赞',favs:'收藏',comments:'论坛',creations:'创作',views:'浏览',likedBy:'被赞'}[t]||'';}
window.switchProfileTab=function(tab){
  profileTab=tab;
  document.querySelectorAll('.profile-tabs .pt').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  renderProfileList();
};
function renderProfileList(){
  const r=getRec();const list=r[profileTab]||[];const el=document.getElementById('profileList');
  if(!list.length){el.classList.add('empty-grid');el.innerHTML='<div class="profile-empty"><div class="icon">📭</div><p>暂无'+_tabLabel(profileTab)+'记录，去体验一下吧～</p></div>';return;}
  el.classList.remove('empty-grid');
  if(profileTab==='comments'||profileTab==='likedBy'){
    el.innerHTML=list.map(c=>'<div class="pl-item"><div class="pl-text"><span class="pl-tag">'+_tabLabel(profileTab)+'</span>'+_esc(c.text)+'</div><div class="pl-time">'+_fmtTime(c.time)+'</div></div>').join('');
  }else{
    el.innerHTML=list.map(c=>{
      const thumb=c.thumb?'<img class="pl-thumb" src="'+c.thumb+'" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="pl-thumb" style="display:flex;align-items:center;justify-content:center;font-size:2rem">🎨</div>';
      return '<div class="pl-card">'+thumb+'<div class="pl-body"><div class="pl-title">'+_esc(c.title||'未命名')+'</div><div class="pl-sub">'+(c.sub||'')+'<br>'+_fmtTime(c.time)+'</div></div></div>';
    }).join('');
  }
}
function renderProfile(){
  const u=currentUserName();const user=u?getUsers()[u]:null;
  const tip=document.getElementById('profileLoginTip'),wrap=document.getElementById('profileWrap');
  if(!u||!user){tip.style.display='block';wrap.style.display='none';return;}
  tip.style.display='none';wrap.style.display='block';
  document.getElementById('phAvatar').textContent=user.avatar||u.charAt(0);
  document.getElementById('phName').textContent=user.nick||u;
  const d=new Date(user.joined||Date.now());
  document.getElementById('phMeta').textContent='加入时间 '+d.toLocaleDateString('zh-CN');
  const r=getRec();
  document.getElementById('phStats').innerHTML=
    '<span class="stat"><b>'+r.likes.length+'</b>点赞</span>'+
    '<span class="stat"><b>'+r.favs.length+'</b>收藏</span>'+
    '<span class="stat"><b>'+r.comments.length+'</b>言论</span>'+
    '<span class="stat"><b>'+r.creations.length+'</b>创作</span>'+
    '<span class="stat"><b>'+r.views.length+'</b>浏览</span>'+
    '<span class="stat"><b>'+r.likedBy.length+'</b>被赞</span>';
  renderProfileList();
}
// 挂载到 window 供外部调用（验证/事件）
window.renderProfile=renderProfile;
window.refreshNav=refreshNav;
window.recordLike=recordLike;
window.recordFav=recordFav;
window.recordComment=recordComment;
window.recordCreation=recordCreation;
window.recordView=recordView;
window.recordLikedBy=recordLikedBy;
window.getRec=getRec;

window.switchAuth=function(mode){
  const isLogin=mode==='login';
  document.getElementById('tabLogin').classList.toggle('active',isLogin);
  document.getElementById('tabReg').classList.toggle('active',!isLogin);
  document.getElementById('loginForm').style.display=isLogin?'flex':'none';
  document.getElementById('regForm').style.display=isLogin?'none':'flex';
};
window.doRegister=function(){
  const u=document.getElementById('regUser').value.trim();
  const p=document.getElementById('regPwd').value;
  const p2=document.getElementById('regPwd2').value;
  const nick=document.getElementById('regNick').value.trim()||u;
  if(!/^.{3,12}$/.test(u)){showToast('用户名需 3-12 位');return;}
  if(p.length<6){showToast('密码至少 6 位');return;}
  if(p!==p2){showToast('两次密码不一致');return;}
  const users=getUsers();
  if(users[u]){showToast('用户名已存在，请直接登录');switchAuth('login');document.getElementById('loginUser').value=u;return;}
  users[u]={pwd:hashPwd(p),nick,avatar:nick.charAt(0),joined:Date.now()};
  saveUsers(users);
  localStorage.setItem(SESSION_KEY,u);
  closeAuth();
  refreshNav();
  showToast('注册成功，欢迎加入瓷韵～');
};
window.doLogin=function(){
  const u=document.getElementById('loginUser').value.trim();
  const p=document.getElementById('loginPwd').value;
  if(!u||!p){showToast('请输入用户名和密码');return;}
  const users=getUsers();
  if(!users[u]){showToast('用户不存在，请先注册');switchAuth('register');document.getElementById('regUser').value=u;return;}
  if(users[u].pwd!==hashPwd(p)){showToast('密码错误');return;}
  localStorage.setItem(SESSION_KEY,u);
  closeAuth();
  refreshNav();
  showToast('登录成功，欢迎回来～');
};
window.logout=function(){
  localStorage.removeItem(SESSION_KEY);
  refreshNav();
  showToast('已退出登录');
};
function refreshNav(){
  const u=currentUserName();
  const user=u?getUsers()[u]:null;
  document.getElementById('navUser').style.display=user?'none':'flex';
  document.getElementById('navUserLogged').style.display=user?'flex':'none';
  if(user){
    document.getElementById('navUsername').textContent=user.nick||u;
    document.getElementById('navAvatar').textContent=user.avatar||u.charAt(0);
  }
  if(document.getElementById('profileWrap'))renderProfile();
}

// ============ 抖音式短视频信息流 ============
// 真实陶瓷制作工艺视频（来源：Mixkit 免费可商用素材）+ 纹样库封面
const FEED_DATA=[
  {title:'拉胚成型 · 手作瓷坯',author:'陶艺师 · 林师傅',desc:'双手在转盘上塑造器型，从一团泥到瓷坯初成的全过程。',likes:1280,favs:326,video:'https://assets.mixkit.co/videos/1975/1975-720.mp4',source:'Mixkit'},
  {title:'陶轮塑形 · 器型精修',author:'瓷艺工作室 · 素瓷',desc:'在旋转的陶轮上修整器型，体现匠人对线条与比例的把控。',likes:856,favs:198,video:'https://assets.mixkit.co/videos/1974/1974-720.mp4',source:'Mixkit'},
  {title:'辘轳成型 · 古法制瓷',author:'陶艺工坊 · 老李',desc:'以辘轳车手工拉制，传承古法制瓷的精妙手法。',likes:2034,favs:512,video:'https://assets.mixkit.co/videos/1973/1973-720.mp4',source:'Mixkit'},
  {title:'陶轮特写 · 指尖造物',author:'窑火传承 · 王老师',desc:'近距离记录拉胚细节，泥土在指尖流转成器。',likes:3120,favs:845,video:'https://assets.mixkit.co/videos/32085/32085-720.mp4',source:'Mixkit'},
  {title:'花器塑型 · 匠心独运',author:'设计研究院 · 小瓷',desc:'陶瓷花瓶从塑型到成型的创作过程，见证器物之美。',likes:672,favs:143,video:'https://assets.mixkit.co/videos/49363/49363-720.mp4',source:'Mixkit'}
];
let feedIndex=0;
// 评论、点赞、收藏状态：按索引存
const feedState={}; // {idx:{liked,faved,comments:[{user,text}]}}
function fstate(i){if(!feedState[i])feedState[i]={liked:false,faved:false,comments:[
  {user:'瓷友·墨白',text:'这纹样太美了，求教程！'},
  {user:'非遗爱好者',text:'传统手艺需要这样传承👍'}
]};return feedState[i];}

function renderFeedCard(item,i){
  // 封面：从 ALL_PATTERNS 取一张对应纹样图
  let poster='';
  if(window.ALL_PATTERNS&&ALL_PATTERNS.length){
    const p=ALL_PATTERNS[(i*7)%ALL_PATTERNS.length];
    poster=p.path.split('/').map(encodeURIComponent).join('/');
  }
  // 优先使用真实陶瓷制作视频；无视频或加载失败时回退到纹样图（Ken Burns 运镜）
  let media='';
  if(item.video){
    media='<video class="fc-video" data-i="'+i+'" src="'+item.video+'" poster="'+poster+'"'+
      ' muted loop playsinline preload="metadata"'+
      ' onerror="this.classList.add(\'fail\');this.style.display=\'none\';var f=this.parentNode.querySelector(\'.fc-img-fb\');if(f)f.style.display=\'block\';">'+
      '<img class="fc-img fc-img-fb" src="'+poster+'" alt="'+item.title+'" style="display:none;object-fit:cover"></video>';
  }else{
    media='<img class="fc-img" src="'+poster+'" alt="'+item.title+'" onerror="this.style.display=\'none\'">';
  }
  return '<div class="feed-card" data-i="'+i+'">'+media+
    '<div class="fc-tap" onclick="feedTogglePlay('+i+')"></div>'+
    '<div class="fc-badge">'+(item.source||'视频')+'</div>'+
    '<div class="fc-overlay"></div>'+
    '<div class="fc-meta"><div class="fc-title">'+item.title+'</div>'+
    '<div class="fc-author">@ '+item.author+'</div>'+
    '<div class="fc-desc">'+item.desc+'</div></div></div>';
}
function renderFeed(){
  const track=document.getElementById('feedTrack');
  track.innerHTML=FEED_DATA.map((it,i)=>renderFeedCard(it,i)).join('');
  // 绝对定位堆叠，通过 translateY 切换
  feedIndex=0;updateFeedTransform();
  // 初次进入视口再自动播放（避免首屏不可见时浪费资源）
  const player=document.getElementById('feedPlayer');
  if(player&&'IntersectionObserver'in window){
    const io=new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if(e.isIntersecting){updateFeedTransform();io.disconnect();}
      });
    },{threshold:.3});
    io.observe(player);
  }
}
function syncFeedVideoPlay(){
  const vids=document.querySelectorAll('.fc-video');
  vids.forEach((v,i)=>{
    if(i===feedIndex){
      // 当前视频：静音自动播放（浏览器策略要求 muted）
      v.muted=true;
      const p=v.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{/* 自动播放被阻止，等待用户点击 */});
    }else{
      // 非当前：暂停并重置到起点
      try{v.pause();}catch(e){}
      try{v.currentTime=0;}catch(e){}
    }
  });
}
function updateFeedTransform(){
  const track=document.getElementById('feedTrack');
  track.style.transform='translateY('+(-feedIndex*100)+'%)';
  refreshFeedActions();
  syncFeedVideoPlay();
}
window.feedTogglePlay=function(i){
  if(i!==feedIndex)return;
  const v=document.querySelector('.fc-video[data-i="'+i+'"]');
  if(!v)return;
  if(v.paused){
    v.muted=false; // 用户主动操作可解除静音
    const p=v.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{v.muted=true;v.play();});
  }else{
    v.pause();
  }
};
window.feedMove=function(dir){
  const n=FEED_DATA.length;
  feedIndex=(feedIndex+dir+n)%n;
  document.getElementById('feedComment').classList.remove('show');
  updateFeedTransform();
  // 浏览记录
  if(currentUserName()){
    const it=FEED_DATA[feedIndex];
    let thumb='';
    if(window.ALL_PATTERNS&&ALL_PATTERNS.length){const p=ALL_PATTERNS[(feedIndex*7)%ALL_PATTERNS.length];thumb=p.path.split('/').map(encodeURIComponent).join('/');}
    recordView({targetId:'feed_'+feedIndex,title:it.title,sub:'短视频 · '+it.author,thumb:thumb});
  }
};
function refreshFeedActions(){
  const it=FEED_DATA[feedIndex],st=fstate(feedIndex);
  const likeBtn=document.getElementById('feedLikeBtn');
  likeBtn.classList.toggle('liked',st.liked);
  document.getElementById('feedLikeCnt').textContent=it.likes+(st.liked?1:0);
  document.getElementById('feedCmtCnt').textContent=st.comments.length;
  document.getElementById('feedFavCnt').textContent=st.faved?'已收藏':(it.favs+' 收藏');
  document.getElementById('feedFavBtn')?.classList.toggle('faved',st.faved);
  // 渲染评论
  const list=document.getElementById('feedCmtList');
  list.innerHTML=st.comments.map(c=>'<div class="cmt"><b>'+c.user+'</b>：'+c.text+'</div>').join('')||'<div class="cmt" style="opacity:.5">还没有评论，快来抢沙发～</div>';
}
window.feedLike=function(){
  const u=currentUserName();
  if(!u){showToast('请先登录后点赞');openAuth('login');return;}
  const st=fstate(feedIndex);
  st.liked=!st.liked;
  refreshFeedActions();
  const it=FEED_DATA[feedIndex];
  recordLike({targetId:'feed_'+feedIndex,title:it.title,sub:'短视频 · '+it.author});
  showToast(st.liked?'已点赞':'已取消点赞');
};
window.feedFav=function(){
  const u=currentUserName();
  if(!u){showToast('请先登录后收藏');openAuth('login');return;}
  const st=fstate(feedIndex);
  st.faved=!st.faved;
  refreshFeedActions();
  const it=FEED_DATA[feedIndex];
  let thumb='';
  if(window.ALL_PATTERNS&&ALL_PATTERNS.length){const p=ALL_PATTERNS[(feedIndex*7)%ALL_PATTERNS.length];thumb=p.path.split('/').map(encodeURIComponent).join('/');}
  recordFav({targetId:'feed_'+feedIndex,title:it.title,sub:'短视频 · '+it.author,thumb:thumb});
  showToast(st.faved?'已收藏到我的瓷韵':'已取消收藏');
};
window.feedShare=function(){
  const it=FEED_DATA[feedIndex];
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText('【'+it.title+'】—— 智承瓷韵短视频分享');
    showToast('已复制分享文案，去发给瓷友吧～');
  }else{
    showToast('分享：'+it.title);
  }
};
window.toggleComment=function(){document.getElementById('feedComment').classList.toggle('show');};
window.feedPostComment=function(){
  const u=currentUserName();
  if(!u){showToast('请先登录后评论');openAuth('login');return;}
  const el=document.getElementById('feedCmtText');
  const text=el.value.trim();
  if(!text){showToast('评论内容不能为空');return;}
  const user=getUsers()[u]||{nick:u};
  fstate(feedIndex).comments.push({user:user.nick||u,text});
  el.value='';
  refreshFeedActions();
  // 言论记录
  const it=FEED_DATA[feedIndex];
  recordComment({targetId:'feed_'+feedIndex,text:text,sub:'评论于《'+it.title+'》'});
  showToast('评论已发布');
  // 模拟被赞（抖音式社交反馈：发表后短时收到点赞）
  setTimeout(()=>{
    recordLikedBy({targetId:'cmt_'+Date.now(),text:'你的评论「'+text.substring(0,20)+(text.length>20?'…':'')+'」收到 1 个点赞',sub:'来自瓷友'});
    if(document.getElementById('profileWrap')&&document.getElementById('profileWrap').style.display!=='none'&&profileTab==='likedBy')renderProfileList();
  },4000);
  // 滚动到底
  const list=document.getElementById('feedCmtList');
  setTimeout(()=>{list.scrollTop=list.scrollHeight;},50);
};

// ============ 滚动入场动画 ============
// CSS animation 自动播放；此处仅负责给元素打 .reveal / .dN 标记（stagger 延迟）
function initReveal(){
  function addReveal(sel){
    document.querySelectorAll(sel).forEach(e=>{if(!e.classList.contains('reveal'))e.classList.add('reveal');});
  }
  function stagger(gridSel){
    document.querySelectorAll(gridSel).forEach(grid=>{
      Array.from(grid.children).forEach((c,i)=>{
        if(!c.classList.contains('reveal'))c.classList.add('reveal');
        if(i<5&&!c.classList.contains('d'+(i+1)))c.classList.add('d'+(i+1));
      });
    });
  }
  addReveal('.section > .container > .center');
  ['.agent-grid','.class-grid','.tech-grid','.platform-grid','.scenario-grid','.adv-grid','.eco-grid','.showcase-grid','.about-grid'].forEach(stagger);
  document.querySelectorAll('.museum-info > *').forEach((c,i)=>{
    if(!c.classList.contains('reveal'))c.classList.add('reveal');
    if(i<4&&!c.classList.contains('d'+(i+1)))c.classList.add('d'+(i+1));
  });
}
window.initReveal=initReveal;

// ============ INIT ============
renderStatic();
renderChips();
syncCustomColorBlock();
loadLibrary();   // 动态扫描本地纹样wy素材
renderCollection();
renderForum();
refreshNav();   // 用户系统：恢复登录态
initHeroCanvas();
loadModels();
initReveal();   // 滚动入场动画
// init 3D after DOM ready
setTimeout(()=>{
  window.__scene.init3D();
  window.__scene.updateVessel();
  document.getElementById('autoRotBtn').classList.add('active');
  window.__museum.initMuseum();
  // 启动后自动调用一次 AI 生图，展示真实纹样
  setTimeout(()=>aiGenerate(),500);
},100);

// resize handler for 3D
window.addEventListener('resize',()=>{
  if(window.__scene) window.__scene.onResize();
});
</script>
