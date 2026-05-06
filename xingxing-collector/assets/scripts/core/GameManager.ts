import { _decorator, Component, Node, game } from 'cc';
import { AudioManager } from './AudioManager';
import { StorageManager } from './StorageManager';
import { AdManager } from './AdManager';

const { ccclass, property } = _decorator;

/**
 * 游戏状态枚举
 */
export enum GameState {
    MENU = 'menu',
    PLAYING = 'playing',
    PAUSED = 'paused',
    LEVEL_COMPLETE = 'level_complete',
    GAME_OVER = 'game_over'
}

/**
 * 角色配置
 */
export interface CharacterConfig {
    id: string;
    name: string;
    color: string;
    skillName: string;
    skillDesc: string;
    rarity: 'N' | 'R' | 'SR' | 'SSR';
}

/**
 * 游戏角色实例
 */
export interface GameCharacter {
    configId: string;
    star: number;  // 1-5星
    count: number;
}

/**
 * 星星收集家 - 游戏主管
 * 负责游戏生命周期管理、状态切换、跨系统协调
 */
@ccclass('GameManager')
export class GameManager extends Component {

    // ==================== 单例模式 ====================
    private static _instance: GameManager | null = null;
    public static get instance(): GameManager {
        if (!GameManager._instance) {
            console.error('[GameManager] Instance not found!');
        }
        return GameManager._instance!;
    }

    // ==================== 属性 ====================
    @property({ type: Node })
    public boardNode: Node | null = null;

    @property({ type: Node })
    public uiNode: Node | null = null;

    // 运行时数据
    private _state: GameState = GameState.MENU;
    private _currentLevel: number = 1;
    private _score: number = 0;
    private _movesLeft: number = 0;
    private _coins: number = 0;

    // 子系统管理器
    public audioManager: AudioManager | null = null;
    public storageManager: StorageManager | null = null;
    public adManager: AdManager | null = null;

    // 角色数据
    private _characters: Map<string, GameCharacter> = new Map();

    // ==================== 生命周期 ====================
    onLoad() {
        if (GameManager._instance) {
            console.warn('[GameManager] Multiple instances detected!');
            this.destroy();
            return;
        }
        GameManager._instance = this;

        // 初始化子系统
        this.initSubSystems();
        
        console.log('[GameManager] initialized');
    }

    start() {
        // 加载玩家数据
        this.loadPlayerData();
        
        // 更新UI
        this.updateUI();
    }

    onDestroy() {
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    // ==================== 子系统初始化 ====================
    private initSubSystems() {
        // 音频管理
        this.audioManager = this.addComponent(AudioManager);
        if (!this.audioManager) {
            this.audioManager = this.node.addComponent(AudioManager);
        }

        // 存储管理
        this.storageManager = this.addComponent(StorageManager);
        if (!this.storageManager) {
            this.storageManager = this.node.addComponent(StorageManager);
        }

        // 广告管理（占位）
        this.adManager = this.addComponent(AdManager);
        if (!this.adManager) {
            this.adManager = this.node.addComponent(AdManager);
        }
    }

    // ==================== 玩家数据 ====================
    private loadPlayerData() {
        if (!this.storageManager) return;

        const data = this.storageManager.loadPlayerData();
        
        this._coins = data.coins;
        this._currentLevel = data.level;
        this._characters = new Map(Object.entries(data.characters || {}));
        
        console.log('[GameManager] Player data loaded:', data);
    }

    public savePlayerData() {
        if (!this.storageManager) return;

        const data = {
            coins: this._coins,
            level: this._currentLevel,
            characters: Object.fromEntries(this._characters)
        };

        this.storageManager.savePlayerData(data);
        console.log('[GameManager] Player data saved');
    }

    // ==================== 状态管理 ====================
    public get state(): GameState {
        return this._state;
    }

    public setState(newState: GameState) {
        const oldState = this._state;
        this._state = newState;
        
        console.log(`[GameManager] State: ${oldState} -> ${newState}`);
        
        // 状态切换处理
        this.onStateChange(oldState, newState);
    }

    private onStateChange(oldState: GameState, newState: GameState) {
        switch (newState) {
            case GameState.PLAYING:
                this.audioManager?.playBgm();
                break;
            case GameState.MENU:
            case GameState.PAUSED:
                this.audioManager?.pauseBgm();
                break;
        }
    }

    // ==================== 游戏流程 ====================
    
    /**
     * 开始新游戏
     */
    public startGame(level: number = this._currentLevel) {
        this._currentLevel = level;
        this._score = 0;
        this._movesLeft = this.getLevelConfig(level).moves;
        
        this.setState(GameState.PLAYING);
        
        // 通知棋盘开始游戏
        // this.boardNode?.emit('startLevel', level);
        
        this.updateUI();
    }

    /**
     * 暂停游戏
     */
    public pauseGame() {
        if (this._state === GameState.PLAYING) {
            this.setState(GameState.PAUSED);
            this.updateUI();
        }
    }

    /**
     * 继续游戏
     */
    public resumeGame() {
        if (this._state === GameState.PAUSED) {
            this.setState(GameState.PLAYING);
            this.updateUI();
        }
    }

    /**
     * 结束关卡
     */
    public completeLevel(success: boolean) {
        if (success) {
            this._currentLevel++;
            this.setState(GameState.LEVEL_COMPLETE);
            
            // 发放奖励
            const config = this.getLevelConfig(this._currentLevel - 1);
            this.addCoins(config.rewards.coins);
            
            // 保存数据
            this.savePlayerData();
        } else {
            this.setState(GameState.GAME_OVER);
        }
        
        this.updateUI();
    }

    /**
     * 返回主菜单
     */
    public returnToMenu() {
        this.setState(GameState.MENU);
        this.updateUI();
    }

    // ==================== 分数与金币 ====================
    
    public addScore(points: number) {
        this._score += points;
        this.updateUI();
    }

    public addCoins(amount: number) {
        this._coins += amount;
        this.updateUI();
        this.savePlayerData();
    }

    public spendCoins(amount: number): boolean {
        if (this._coins >= amount) {
            this._coins -= amount;
            this.updateUI();
            this.savePlayerData();
            return true;
        }
        return false;
    }

    public useMove() {
        this._movesLeft--;
        this.updateUI();
        
        if (this._movesLeft <= 0) {
            this.onMovesExhausted();
        }
    }

    private onMovesExhausted() {
        // 检查是否达到目标
        const config = this.getLevelConfig(this._currentLevel);
        if (this._score >= config.target.score) {
            this.completeLevel(true);
        } else {
            this.completeLevel(false);
        }
    }

    // ==================== 角色系统 ====================
    
    /**
     * 获取角色配置
     */
    public static getCharacterConfigs(): CharacterConfig[] {
        return [
            {
                id: 'sakura',
                name: '小樱',
                color: '#ffb7c5',
                skillName: '樱花冲击',
                skillDesc: '消除 3×3 范围',
                rarity: 'N'
            },
            {
                id: 'moonbear',
                name: '月宝',
                color: '#9b88d4',
                skillName: '月光净化',
                skillDesc: '消除整列',
                rarity: 'R'
            },
            {
                id: 'starry',
                name: '星旅',
                color: '#87ceeb',
                skillName: '流星雨',
                skillDesc: '消除整行',
                rarity: 'R'
            },
            {
                id: 'bubble',
                name: '泡泡',
                color: '#b8e4f0',
                skillName: '泡泡爆炸',
                skillDesc: '消除周围 3×3',
                rarity: 'N'
            },
            {
                id: 'rainbow',
                name: '彩彩',
                color: '#ffb347',
                skillName: '彩虹桥',
                skillDesc: '消除所有同颜色',
                rarity: 'SR'
            },
            {
                id: 'sunset',
                name: '夕火',
                color: '#ff7f50',
                skillName: '落日余晖',
                skillDesc: '全屏消除低星级',
                rarity: 'SSR'
            }
        ];
    }

    /**
     * 添加角色
     */
    public addCharacter(characterId: string, count: number = 1): GameCharacter | null {
        let char = this._characters.get(characterId);
        
        if (char) {
            char.count += count;
        } else {
            char = {
                configId: characterId,
                star: 1,
                count: count
            };
            this._characters.set(characterId, char);
        }
        
        this.savePlayerData();
        return char;
    }

    /**
     * 检查是否拥有角色
     */
    public hasCharacter(characterId: string): boolean {
        const char = this._characters.get(characterId);
        return char !== undefined && char.count > 0;
    }

    // ==================== 关卡配置 ====================
    
    public getLevelConfig(level: number): any {
        // 关卡配置表
        const configs: { [key: number]: any } = {
            1: {
                id: 1,
                moves: 30,
                target: { score: 1000 },
                rewards: { coins: 50 }
            },
            2: {
                id: 2,
                moves: 28,
                target: { score: 1500 },
                rewards: { coins: 60 }
            },
            3: {
                id: 3,
                moves: 26,
                target: { score: 2000 },
                rewards: { coins: 70 }
            },
            4: {
                id: 4,
                moves: 24,
                target: { score: 2500 },
                rewards: { coins: 80 }
            },
            5: {
                id: 5,
                moves: 22,
                target: { score: 3000 },
                rewards: { coins: 100, character: 'sakura' }
            }
        };

        // 后续关卡递增加难
        if (level > 5) {
            const baseConfig = configs[5];
            return {
                ...baseConfig,
                id: level,
                moves: Math.max(15, baseConfig.moves - Math.floor((level - 5) * 0.5)),
                target: { score: baseConfig.target.score + (level - 5) * 500 },
                rewards: { 
                    coins: baseConfig.rewards.coins + (level - 5) * 10,
                    character: level % 10 === 0 ? 'moonbear' : null
                }
            };
        }

        return configs[level] || configs[1];
    }

    // ==================== UI 更新 ====================
    
    private updateUI() {
        // 发送UI更新事件
        this.node.emit('uiUpdate', {
            state: this._state,
            level: this._currentLevel,
            score: this._score,
            moves: this._movesLeft,
            coins: this._coins
        });
    }

    // ==================== Getters ====================
    
    public get currentLevel(): number { return this._currentLevel; }
    public get score(): number { return this._score; }
    public get movesLeft(): number { return this._movesLeft; }
    public get coins(): number { return this._coins; }
}
