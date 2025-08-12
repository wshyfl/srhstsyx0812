

//技能类型
const ActorSkillData = {
    1: {
        id: 1, name: "飞毛腿", duration: 10, cooldown: 30, addSpeed: 100, skillBg: "疾跑", money: 0,
        get desc() {
            return `使用技能后移速增加${this.addSpeed}%，持续${this.duration}秒，冷却${this.cooldown}秒，待技能完全结束后再进入冷却时间`;
        }
    },
    2: {
        id: 2, name: "幻梦公主", duration: 0, cooldown: 15, controlTime: 3, skillBg: "水牢", money: 2000,
        get desc() {
            return `放置一个水泡，怪物踩到后会困在水泡中，控制时间${this.controlTime}秒，冷却${this.cooldown}秒`;
        }
    },
    3: {
        id: 3, name: "香蕉侠", duration: 0, cooldown: 10, controlTime: 2, skillBg: "滑倒", money: 2000,
        get desc() {
            return `放置一个香蕉皮，怪物踩到后会滑倒，这个状态持续${this.controlTime}秒`;
        }
    },
    4: {
        id: 4, name: "炸弹超人", duration: 0, cooldown: 15, controlTime: 2, range: 1000, skillBg: "炸弹", money: 2000,
        get desc() {
            return `扔出一个炸弹，怪物被炸到后会变成焦黑色持续x秒`;
        }
    },
    5: {
        id: 5, name: "忍者", duration: 5, cooldown: 20, skillBg: "隐遁", money: 2000,
        get desc() {
            return `使用技能后，忍者的身体变的透明，此时为隐形状态不受怪物攻击，怪物丢失追击目标，停在原地待机，待技能完全结束后再进入冷却时间`;
        }
    },
    6: {
        id: 6, name: "哪吒", duration: 0.3, cooldown: 15, skillBg: "冲刺", money: 2000,
        get desc() {
            return `使用技能后向前冲刺一段距离，冲刺时需要有火焰特效配合，冲刺时碰到障碍物会停止冲刺，碰到怪物会直接穿过，此状态可以拾取碎片`;
        }
    },
    7: {
        id: 7, name: "未来战士", duration: 0, cooldown: 30, skillBg: "传送门", money: 2000,
        get desc() {
            return `释放技能会在身体前方出现一个传送门，将通过传送门的物体传送到地图随机位置`;
        }
    },
    8: {
        id: 8, name: "磁铁侠", duration: 10, cooldown: 30, skillBg: "磁吸", money: 2000,
        get desc() {
            return `使用技能后，手上的磁铁石会有吸力特效，会将范围内的碎片吸到角色身上，吸取圆形范围内所有碎片。待技能完全结束后再进入冷却时间`;
        }
    }
};
//移动状态
const MoveState = cc.Enum({
    None: -1,
    Stand: -1,
    Up: -1,
    Right: -1,
    Down: -1,
    Left: -1
});

var GameMode = cc.Enum({
    SingleMode: 1,   // 单人模式
    DoubelMode: 2,   // 双人模式
});


const GameState = cc.Enum({
    None: -1,    // 游戏进行中
    Playing: -1,    // 游戏进行中
    Paused: -1,     // 游戏暂停
    Over: -1        // 游戏结束
});

//角色阵营
const ActorTeam = cc.Enum({
    None: -1,
    Human: -1,
    Monster: -1
});

//角色控制类型
const ActorControl = cc.Enum({
    Robot: 0,
    Player1: 1,
    Player2: 2,
});
//角色动作状态
const ActorActionState = cc.Enum({
    Sport: -1,  //移动 待机
    Attack: -1,
    Skill: -1,
    Freeze: -1,
    Other: -1
});

//角色技能类型
const ActorSkillType = cc.Enum({
    FeiMaoTui: 1,
    HuanMengGongZhu: 2,
    XiangJIaoXia: 3,
    ZhaDanChaoRen: 4,
    RenZhe: 5,
    NeZha: 6,
    WeiLaiZhanShi: 7,
    CiTieXia: 8,
});

//角色阵营
const MonsterType = cc.Enum({
    Chasing: -1,    //追击
    Patrol: -1      //巡逻
});

//角色阵营
const BufferKey = cc.Enum({
    Dici: -1,    //地刺
});

//角色阵营
const MapName = cc.Enum({
    MapPark: "MapPark",    //游乐场
    MapSchool: "MapSchool",    //幼儿园
    MapHospital: "MapHospital",    //医院
    HouShi: "HouShi",    //新地图 后室
});





module.exports = {
    GameMode: GameMode,
    GameState: GameState,
    MoveState: MoveState,
    ActorTeam: ActorTeam,
    ActorControl: ActorControl,
    ActorActionState: ActorActionState,
    MonsterType: MonsterType,
    ActorSkillData: ActorSkillData,
    ActorSkillType: ActorSkillType,
    BufferKey: BufferKey,
    MapName: MapName,
};
