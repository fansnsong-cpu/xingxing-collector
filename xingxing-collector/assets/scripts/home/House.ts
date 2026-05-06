import { _decorator, Component, Node, Label, Sprite, Color } from 'cc';
import { GameManager, CharacterConfig, GameCharacter } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 小屋系统
 * 星星收集家的小屋功能
 */
@ccclass('House')
export class House extends Component {

    // ==================== 小屋配置 ====================
    
    /** 小屋等级上限 */
    private static readonly MAX_HOUSE_LEVEL = 10;
    
    /** 每级需要的星星币 */
    private static readonly LEVEL_UP_COST = 500;

    // ==================== UI引用 ====================
    @property({ type: Node })
    public houseRoot: Node | null = null;

    @property({ type: Node })
    public floorNode: Node | null = null;

    @property({ type: Node })
    public wallNode: Node | null = null;

    @property({ type: Node })
    public charactersContainer: Node | null = null;

    @property({ type: Node })
    public furnitureContainer: Node | null = null;

    @property({ type: Label })
    public houseLevelLabel: Label | null = null;

    @property({ type: Label })
    public coinLabel: Label | null = null;

    @property({ type: Node })
    public characterInfoPanel: Node | null = null;

    @property({ type: Label })
    public characterNameLabel: Label | null = null;

    @property({ type: Label })
    public characterStarLabel: Label | null = null;

    // ==================== 运行时数据 ====================
    private _houseLevel: number = 1;
    private _ownedCharacters: GameCharacter[] = [];
    private _placedCharacters: PlacedCharacter[] = [];
    private _selectedCharacter: GameCharacter | null = null;

    // ==================== 生命周期 ====================
    onLoad() {
        console.log('[House] loaded');
        
        // 加载小屋数据
        this.loadHouseData();
    }

    start() {
        // 渲染小屋
        this.renderHouse();
        this.updateUI();
    }

    // ==================== 数据管理 ====================

    /**
     * 加载小屋数据
     */
    private loadHouseData(): void {
        const playerData = GameManager.instance.storageManager?.loadPlayerData();
        
        if (playerData && playerData.house) {
            this._houseLevel = playerData.house.floor || 1;
        }

        // 加载拥有的角色
        this.refreshOwnedCharacters();
    }

    /**
     * 保存小屋数据
     */
    public saveHouseData(): void {
        const data = {
            floor: this._houseLevel,
            wall: 1,
            furniture: [],
            placedCharacters: this._placedCharacters
        };

        // 保存到玩家数据
        console.log('[House] House data saved:', data);
    }

    /**
     * 刷新拥有的角色列表
     */
    private refreshOwnedCharacters(): void {
        const configs = GameManager.getCharacterConfigs();
        this._ownedCharacters = [];

        configs.forEach(config => {
            if (GameManager.instance.hasCharacter(config.id)) {
                const char = GameManager.instance['_characters'].get(config.id);
                if (char) {
                    this._ownedCharacters.push(char as GameCharacter);
                }
            }
        });

        console.log(`[House] Owned characters: ${this._ownedCharacters.length}`);
    }

    // ==================== 小屋渲染 ====================

    /**
     * 渲染小屋
     */
    private renderHouse(): void {
        // 渲染地板
        this.renderFloor();
        
        // 渲染墙壁
        this.renderWall();
        
        // 渲染角色
        this.renderCharacters();
        
        // 渲染家具
        this.renderFurniture();
    }

    /**
     * 渲染地板
     */
    private renderFloor(): void {
        if (!this.floorNode) return;

        // 根据小屋等级选择地板样式
        const floorStyle = Math.min(this._houseLevel, 5);
        console.log(`[House] Rendering floor style: ${floorStyle}`);
        
        // TODO: 设置地板材质/颜色
        // this.floorNode.getComponent(Sprite).color = new Color(0xF5, 0xE6, 0xD3);
    }

    /**
     * 渲染墙壁
     */
    private renderWall(): void {
        if (!this.wallNode) return;

        // 根据小屋等级选择墙壁样式
        console.log(`[House] Rendering wall style: ${this._houseLevel}`);
        
        // TODO: 设置墙壁材质/颜色
        // this.wallNode.getComponent(Sprite).color = new Color(0xFF, 0xF0, 0xE5);
    }

    /**
     * 渲染角色
     */
    private renderCharacters(): void {
        if (!this.charactersContainer) return;

        // 清除旧的角色节点
        this.charactersContainer.removeAllChildren();

        // 获取角色配置
        const configs = GameManager.getCharacterConfigs();

        // 创建角色节点
        for (const char of this._ownedCharacters) {
            const config = configs.find(c => c.id === char.configId);
            if (!config) continue;

            // 创建角色节点
            const charNode = this.createCharacterNode(config, char);
            charNode.setParent(this.charactersContainer);

            // 设置位置（可以根据角色数量自动布局）
            const index = this._ownedCharacters.indexOf(char);
            const x = (index % 4) * 100 - 150;
            const y = Math.floor(index / 4) * -100 + 50;
            charNode.setPosition(x, y, 0);
        }

        console.log(`[House] Rendered ${this._ownedCharacters.length} characters`);
    }

    /**
     * 创建角色节点
     */
    private createCharacterNode(config: CharacterConfig, char: GameCharacter): Node {
        const node = new Node(`Character_${config.name}`);
        
        // 添加Sprite组件
        // const sprite = node.addComponent(Sprite);
        // sprite.color = new Color(config.color);

        // 添加点击事件
        node.on('click', () => {
            this.onCharacterClicked(char, config);
        });

        // TODO: 添加角色动画组件

        return node;
    }

    /**
     * 渲染家具
     */
    private renderFurniture(): void {
        if (!this.furnitureContainer) return;

        // 根据小屋等级解锁更多家具位置
        console.log(`[House] Rendering furniture for house level: ${this._houseLevel}`);
    }

    // ==================== 角色交互 ====================

    /**
     * 角色被点击
     */
    private onCharacterClicked(char: GameCharacter, config: CharacterConfig): void {
        console.log(`[House] Character clicked: ${config.name}`);
        
        this._selectedCharacter = char;
        
        // 显示角色信息面板
        this.showCharacterInfo(config, char);
        
        // 播放角色互动动画
        this.playCharacterAnimation(char);
        
        // 播放音效
        GameManager.instance.audioManager?.playButtonSound();
    }

    /**
     * 显示角色信息
     */
    private showCharacterInfo(config: CharacterConfig, char: GameCharacter): void {
        if (this.characterInfoPanel) {
            this.characterInfoPanel.active = true;
        }

        if (this.characterNameLabel) {
            this.characterNameLabel.string = config.name;
        }

        if (this.characterStarLabel) {
            this.characterStarLabel.string = `${'⭐'.repeat(char.star)}`;
        }
    }

    /**
     * 隐藏角色信息
     */
    public hideCharacterInfo(): void {
        if (this.characterInfoPanel) {
            this.characterInfoPanel.active = false;
        }
        this._selectedCharacter = null;
    }

    /**
     * 播放角色动画
     */
    private playCharacterAnimation(char: GameCharacter): void {
        // 获取角色的节点
        const charNode = this.charactersContainer?.children.find(
            node => node.name.includes(char.configId)
        );

        if (charNode) {
            // 播放待机动画的变化（开心、招手等）
            console.log(`[House] Playing animation for ${char.configId}`);
            
            // TODO: 使用tween动画
            // tween(charNode)
            //     .to(0.2, { scale: cc.v3(1.2, 1.2, 1) })
            //     .to(0.2, { scale: cc.v3(1, 1, 1) })
            //     .start();
        }
    }

    /**
     * 将角色放入小屋
     */
    public placeCharacterInHouse(charId: string, position: { x: number, y: number }): boolean {
        const char = this._ownedCharacters.find(c => c.configId === charId);
        if (!char) {
            console.log('[House] Character not found in inventory');
            return false;
        }

        // 检查是否已在小屋中
        const existing = this._placedCharacters.find(p => p.configId === charId);
        if (existing) {
            console.log('[House] Character already placed');
            return false;
        }

        // 添加到已放置列表
        this._placedCharacters.push({
            configId: charId,
            position: position
        });

        // 重新渲染
        this.renderCharacters();
        this.saveHouseData();

        console.log(`[House] Character ${charId} placed in house`);
        return true;
    }

    /**
     * 从小屋移除角色
     */
    public removeCharacterFromHouse(charId: string): boolean {
        const index = this._placedCharacters.findIndex(p => p.configId === charId);
        if (index === -1) {
            return false;
        }

        this._placedCharacters.splice(index, 1);
        this.renderCharacters();
        this.saveHouseData();

        console.log(`[House] Character ${charId} removed from house`);
        return true;
    }

    // ==================== 小屋升级 ====================

    /**
     * 升级小屋
     */
    public upgradeHouse(): boolean {
        if (this._houseLevel >= House.MAX_HOUSE_LEVEL) {
            console.log('[House] House already at max level');
            return false;
        }

        const cost = this.getUpgradeCost();
        
        if (!GameManager.instance.spendCoins(cost)) {
            console.log('[House] Not enough coins for upgrade');
            return false;
        }

        this._houseLevel++;
        this.saveHouseData();
        this.renderHouse();
        this.updateUI();

        // 播放升级特效
        this.playUpgradeEffect();

        console.log(`[House] House upgraded to level ${this._houseLevel}`);
        return true;
    }

    /**
     * 获取升级费用
     */
    public getUpgradeCost(): number {
        return House.LEVEL_UP_COST * this._houseLevel;
    }

    /**
     * 播放升级特效
     */
    private playUpgradeEffect(): void {
        console.log('[House] Playing upgrade effect');
        
        // 播放音效
        GameManager.instance.audioManager?.playLevelUpSound();
        
        // TODO: 播放升级动画（粒子特效、闪光等）
    }

    // ==================== UI更新 ====================

    private updateUI(): void {
        if (this.houseLevelLabel) {
            this.houseLevelLabel.string = `小屋 Lv.${this._houseLevel}`;
        }

        if (this.coinLabel) {
            this.coinLabel.string = `${GameManager.instance.coins}`;
        }
    }

    // ==================== 分享功能 ====================

    /**
     * 分享我的小屋
     */
    public shareMyHouse(): void {
        console.log('[House] Sharing house');
        
        // 生成小屋截图
        // const texture = this.houseRoot.captureTexture();
        
        // 分享到微信
        // wx.shareAppMessage({
        //     title: '快来参观我的星星小屋！',
        //     imageUrl: texture
        // });
    }
}

/**
 * 已放置角色数据结构
 */
interface PlacedCharacter {
    configId: string;
    position: { x: number, y: number };
}
