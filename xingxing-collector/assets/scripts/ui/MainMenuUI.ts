import { _decorator, Component, Node, Label, Sprite, Color } from 'cc';
import { GameManager, GameState } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 主界面UI控制器
 */
@ccclass('MainMenuUI')
export class MainMenuUI extends Component {

    // ==================== UI引用 ====================
    @property({ type: Node })
    public menuRoot: Node | null = null;

    @property({ type: Node })
    public gameRoot: Node | null = null;

    @property({ type: Node })
    public levelCompleteNode: Node | null = null;

    @property({ type: Node })
    public gameOverNode: Node | null = null;

    // 顶部UI
    @property({ type: Label })
    public levelLabel: Label | null = null;

    @property({ type: Label })
    public scoreLabel: Label | null = null;

    @property({ type: Label })
    public movesLabel: Label | null = null;

    @property({ type: Label })
    public coinsLabel: Label | null = null;

    // 底部标签
    @property({ type: Node })
    public tabBar: Node | null = null;

    @property({ type: Node })
    public tabGame: Node | null = null;

    @property({ type: Node })
    public tabGashapon: Node | null = null;

    @property({ type: Node })
    public tabHouse: Node | null = null;

    // ==================== 生命周期 ====================
    onLoad() {
        // 监听游戏事件
        this.setupEventListeners();
        
        console.log('[MainMenuUI] loaded');
    }

    start() {
        // 初始化UI
        this.showMenu();
        this.updateUI();
    }

    // ==================== 事件监听 ====================
    
    private setupEventListeners() {
        const gameManager = GameManager.instance;
        
        // 监听UI更新事件
        gameManager.node.on('uiUpdate', this.onUIUpdate, this);
    }

    private onUIUpdate(data: any) {
        this.updateUI();
        this.onGameStateChange(data.state);
    }

    private onGameStateChange(state: GameState) {
        switch (state) {
            case GameState.MENU:
                this.showMenu();
                break;
            case GameState.PLAYING:
                this.showGame();
                break;
            case GameState.PAUSED:
                this.showGame();
                break;
            case GameState.LEVEL_COMPLETE:
                this.showLevelComplete();
                break;
            case GameState.GAME_OVER:
                this.showGameOver();
                break;
        }
    }

    // ==================== UI更新 ====================

    private updateUI() {
        const gm = GameManager.instance;

        if (this.levelLabel) {
            this.levelLabel.string = `关卡 ${gm.currentLevel}`;
        }

        if (this.scoreLabel) {
            this.scoreLabel.string = `${gm.score}`;
        }

        if (this.movesLabel) {
            this.movesLabel.string = `剩余 ${gm.movesLeft} 步`;
        }

        if (this.coinsLabel) {
            this.coinsLabel.string = `${gm.coins}`;
        }
    }

    // ==================== 界面切换 ====================

    private showMenu() {
        if (this.menuRoot) this.menuRoot.active = true;
        if (this.gameRoot) this.gameRoot.active = false;
        if (this.levelCompleteNode) this.levelCompleteNode.active = false;
        if (this.gameOverNode) this.gameOverNode.active = false;
    }

    private showGame() {
        if (this.menuRoot) this.menuRoot.active = false;
        if (this.gameRoot) this.gameRoot.active = true;
        if (this.levelCompleteNode) this.levelCompleteNode.active = false;
        if (this.gameOverNode) this.gameOverNode.active = false;
    }

    private showLevelComplete() {
        if (this.menuRoot) this.menuRoot.active = false;
        if (this.gameRoot) this.gameRoot.active = false;
        if (this.levelCompleteNode) this.levelCompleteNode.active = true;
        if (this.gameOverNode) this.gameOverNode.active = false;
    }

    private showGameOver() {
        if (this.menuRoot) this.menuRoot.active = false;
        if (this.gameRoot) this.gameRoot.active = false;
        if (this.levelCompleteNode) this.levelCompleteNode.active = false;
        if (this.gameOverNode) this.gameOverNode.active = true;
    }

    // ==================== 按钮事件 ====================

    /**
     * 开始游戏按钮
     */
    public onStartGameClicked() {
        console.log('[MainMenuUI] Start game clicked');
        GameManager.instance.audioManager?.playButtonSound();
        GameManager.instance.startGame();
    }

    /**
     * 继续游戏按钮
     */
    public onContinueClicked() {
        console.log('[MainMenuUI] Continue clicked');
        GameManager.instance.audioManager?.playButtonSound();
        GameManager.instance.resumeGame();
    }

    /**
     * 返回菜单按钮
     */
    public onBackToMenuClicked() {
        console.log('[MainMenuUI] Back to menu clicked');
        GameManager.instance.audioManager?.playButtonSound();
        GameManager.instance.returnToMenu();
    }

    /**
     * 下一关按钮
     */
    public onNextLevelClicked() {
        console.log('[MainMenuUI] Next level clicked');
        GameManager.instance.audioManager?.playButtonSound();
        GameManager.instance.startGame(GameManager.instance.currentLevel + 1);
    }

    /**
     * 重新开始按钮
     */
    public onRestartClicked() {
        console.log('[MainMenuUI] Restart clicked');
        GameManager.instance.audioManager?.playButtonSound();
        GameManager.instance.startGame();
    }

    /**
     * 看广告复活按钮
     */
    public onWatchAdReviveClicked() {
        console.log('[MainMenuUI] Watch ad revive clicked');
        GameManager.instance.audioManager?.playButtonSound();
        
        // 显示激励视频广告
        GameManager.instance.adManager?.showRewardedVideoAd(
            () => {
                // 观看成功，继续游戏
                console.log('[MainMenuUI] Ad watched, reviving...');
                GameManager.instance.resumeGame();
            },
            () => {
                // 关闭广告，未看完
                console.log('[MainMenuUI] Ad closed without complete');
            },
            (err) => {
                // 错误处理
                console.error('[MainMenuUI] Ad error:', err);
            }
        );
    }

    /**
     * 扭蛋标签点击
     */
    public onTabGashaponClicked() {
        console.log('[MainMenuUI] Tab gashapon clicked');
        GameManager.instance.audioManager?.playButtonSound();
        // 切换到扭蛋界面
    }

    /**
     * 小屋标签点击
     */
    public onTabHouseClicked() {
        console.log('[MainMenuUI] Tab house clicked');
        GameManager.instance.audioManager?.playButtonSound();
        // 切换到小屋界面
    }

    /**
     * 设置按钮点击
     */
    public onSettingsClicked() {
        console.log('[MainMenuUI] Settings clicked');
        GameManager.instance.audioManager?.playButtonSound();
        // 打开设置面板
    }

    /**
     * 分享按钮点击
     */
    public onShareClicked() {
        console.log('[MainMenuUI] Share clicked');
        GameManager.instance.audioManager?.playButtonSound();
        // 触发分享
    }
}
