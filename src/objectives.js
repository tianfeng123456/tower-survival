// Opening three-step objective tracker (chop -> build -> survive wave 1).
export const OBJECTIVES=[
 {id:'chop',text:'靠近树木砍下第一棵树'},
 {id:'build',text:'建造一座围墙或箭塔'},
 {id:'wave',text:'守住第 1 波'},
];
export function objectiveStatus(g){
 const s=g.stats||{};
 const wave1=g.waves.index>0||(g.waves.index===0&&g.waves.queue===0&&g.waves.giants===0&&g.enemies.list.length===0);
 return {chop:(s.chopped||0)>0,build:(s.built||0)>0,wave:wave1};
}
