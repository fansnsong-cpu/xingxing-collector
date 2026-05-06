import { _decorator, Component, Node, Label, Sprite, Color } from 'cc';
import { GameManager, CharacterConfig } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 扭蛋机系统
 */
@ccclass('Gashapon')
export class Gashapon extends Component {

    // ==================== 扭蛋配置 ====================
    
    /** 单次扭蛋消耗 */
    private static readonly SINGLE_COST = 10;
    
    /** 十连扭蛋消耗 */
    private static readonly MULTI_COST = 90;  // 9折优惠
    
    /** 扭蛋概率配置 */
    private static readonly PROBABILITIES = {
        'N': { weight: 60, minStar: 1, maxStar: 2 },
        'R': { weight: 30, minStar: 3, maxStar: 3 },
        'SR': { weight: 8, minStar: 4, maxStar: 4 },
        'SSR': { weight: 2, minStar: 5, maxStar: 5 }
    };

    // ==================== UI引用 ====================
    @property({ type: Node })
    public machineBody: Node | null = null;

    @property({ type: Node })
    public capsulePreview: Node | null = null;

    @property({ type: Label })
    public coinLabel: Label | null = null;

    @property({ type: Label })
    public resultLabel: Label | null = null;

    @property({ type: Node })
    public resultNode: Node | null = null;

    @property({ type: Node })
    public particlesNode: Node | null = null;

    // ==================== 运行时 ====================
    private _isSpinning: boolean = false;
    private _spinCount: number = 0;

    // ==================== 生命周期 ====================
    onLoad() {
        console.log('[Gashapon] loaded');
    }

    start() {
        this.updateCoinDisplay();
    }

    // ==================== 扭蛋操作 ====================

    /**
     * 单抽
     */
    public async singlePull(): Promise<void> {
        if (this._isSpinning) return;

        // 检查金币
        if (!GameManager.instance.spendCoins(Gashapon.SINGLE_COST)) {
            console.log('[Gashapon] Not enough coins!');
            this.showInsufficientCoins();
            return;
        }

        await this.spin(1);
    }

    /**
     * 十连抽
     */
    public async multiPull(): Promise<void> {
        if (this._isSpinning) return;

        // 检查金币
        if (!GameManager.instance.spendCoins(Gashapon.MULTI_COST)) {
            console.log('[Gashapon] Not enough coins!');
            this.showInsufficientCoins();
            return;
        }

        await this.spin(10);
    }

    /**
     * 免费扭蛋（每日一次）
     */
    public async freePull(): Promise<void> {
        if (this._isSpinning) return;

        // TODO: 检查是否已使用每日免费扭蛋

        console.log('[Gashapon] Free pull triggered');
        
        // 显示激励视频
        GameManager.instance.adManager?.showRewardedVideoAd(
            async () => {
                // 观看成功，给予免费扭蛋
                GameManager.instance.audioManager?.playGashaponSound();
                await this.spin(1, true);
            },
            () => {
                console.log('[Gashapon] Free pull cancelled');
            }
        );
    }

    /**
     * 执行扭蛋动画
     */
    private async spin(count: number, isFree: boolean = false): Promise<void> {
        this._isSpinning = true;
        this._spinCount = count;

        console.log(`[Gashapon] Spinning ${count} times...`);

        // 播放音效
        GameManager.instance.audioManager?.playGashaponSound();

        // 执行扭蛋
        const results: GashaponResult[] = [];
        
        for (let i = 0; i < count; i++) {
            const result = this.rollGashapon();
            results.push(result);
            
            // 添加角色到玩家背包
            GameManager.instance.addCharacter(result.configId, 1);
            
            // 播放动画
            await this.playRollAnimation(result, i);
        }

        // 显示结果汇总
        await this.showResultSummary(results, isFree);

        this._isSpinning = false;
        this._spinCount = 0;
    }

    /**
     * 扭蛋ROLL逻辑
     */
    private rollGashapon(): GashaponResult {
        // 获取所有角色配置
        const allConfigs = GameManager.getCharacterConfigs();
        
        // 根据概率选择稀有度
        const rarity = this.rollRarity();
        
        // 从对应稀有度中选择角色
        const eligibleConfigs = allConfigs.filter(c => c.rarity === rarity);
        const selectedConfig = eligibleConfigs[Math.floor(Math.random() * eligibleConfigs.length)];
        
        // 随机星级
        const rarityConfig = Gashapon.PROBABILITIES[rarity];
        const star = rarityConfig.minStar + Math.floor(Math.random() * (rarityConfig.maxStar - rarityConfig.minStar + 1));

        return {
            configId: selectedConfig.id,
            name: selectedConfig.name,
            rarity: rarity,
            star: star,
            isNew: !GameManager.instance.hasCharacter(selectedConfig.id)
        };
    }

    /**
     * 根据概率roll稀有度
     */
    private rollRarity(): 'N' | 'R' | 'SR' | 'SSR' {
        const totalWeight = 100;
        let roll = Math.random() * totalWeight;
        let cumulative = 0;

        for (const [rarity, config] of Object.entries(Gashapon.PROBABILITIES)) {
            cumulative += config.weight;
            if (roll < cumulative) {
                return rarity as 'N' | 'R' | 'SR' | 'SSR';
            }
        }

        return 'N';
    }

    // ==================== 动画效果 ====================

    /**
     * 播放扭蛋动画
     */
    private async playRollAnimation(result: GashaponResult, index: number): Promise<void> {
        console.log(`[Gashapon] Rolling ${result.name} (${result.rarity})...`);
        
        // 动画效果
        // 1. 显示扭蛋机动画
        // 2. 扭蛋弹出
        // 3. 显示角色
        
        return new Promise(resolve => setTimeout(resolve, 300));
    }

    /**
     * 显示结果汇总
     */
    private async showResultSummary(results: GashaponResult[], isFree: boolean): Promise<void> {
        // 统计结果
        const summary = this.summarizeResults(results);
        
        console.log(`[Gashapon] Results: ${JSON.stringify(summary)}`);

        // 播放成功音效
        if (summary.ssrCount > 0) {
            GameManager.instance.audioManager?.playLevelUpSound();
        } else {
            GameManager.instance.audioManager?.playCoinSound();
        }

        // TODO: 显示结果界面
    }

    /**
     * 统计扭蛋结果
     */
    private summarizeResults(results: GashaponResult[]): any {
        const summary = {
            total: results.length,
            nCount: 0,
            rCount: 0,
            srCount: 0,
            ssrCount: 0,
            newCount: 0
        };

        for (const r of results) {
            switch (r.rarity) {
                case 'N': summary.nCount++; break;
                case 'R': summary.rCount++; break;
                case 'SR': summary.srCount++; break;
                case 'SSR': summary.ssrCount++; break;
            }
            if (r.isNew) summary.newCount++;
        }

        return summary;
    }

    // ==================== UI更新 ====================

    private updateCoinDisplay(): void {
        if (this.coinLabel) {
            this.coinLabel.string = `${GameManager.instance.coins}`;
        }
    }

    private showInsufficientCoins(): void {
        console.log('[Gashapon] Show insufficient coins UI');
        // TODO: 显示金币不足提示
    }

    // ==================== 便捷方法 ====================

    /**
     * 获取扭蛋机配置信息
     */
    public getGashaponInfo(): any {
        return {
            singleCost: Gashapon.SINGLE_COST,
            multiCost: Gashapon.MULTI_COST,
            probabilities: Gashapon.PROBABILITIES
        };
    }

    /**
     * 检查是否可以免费扭蛋
     */
    public canFreePull(): boolean {
        // TODO: 检查每日免费次数
        return true;
    }
}

/**
 * 扭蛋结果接口
 */
export interface GashaponResult {
    configId: string;
    name: string;
    rarity: 'N' | 'R' | 'SR' | 'SSR';
    star: number;
    isNew: boolean;
}
