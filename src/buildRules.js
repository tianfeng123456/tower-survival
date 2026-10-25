// Pure build-placement rules so they can be unit tested without Three.js.
export const BUILD_REASONS={
 bounds:{short:'出界',toast:'超出可建造范围，靠近空地内侧再试'},
 core:{short:'核心禁区',toast:'核心周围禁止建造，往外走一格'},
 overlap:{short:'已有建筑',toast:'这里已有建筑，换个空格'},
 tree:{short:'压到树',toast:'树木挡住了，先把树砍掉'},
 enemy:{short:'有敌人',toast:'敌人站在格子上，清掉后再建'},
 wood:{short:'木材不足',toast:'木材不足，靠近树木采集'},
};
export function buildBlockReason(g,cx,cz,{cell,radius,key,cost=0}){
 if(Math.abs(cx)>radius-1||Math.abs(cz)>radius-1)return 'bounds';
 if(Math.hypot(cx,cz)<=2)return 'core';
 if(g.buildings?.map?.has(key(cx,cz)))return 'overlap';
 if(g.trees.some(t=>t.alive&&Math.hypot(t.x-cx*cell,t.z-cz*cell)<1.3))return 'tree';
 if(g.enemies.list.some(e=>Math.hypot(e.x-cx*cell,e.z-cz*cell)<1.4))return 'enemy';
 if(cost&&g.wood<cost)return 'wood';
 return null;
}
