import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 广告管理器
 * 负责微信小程序广告的展示和回调处理
 */
@ccclass('AdManager')
export class AdManager extends Component {

    // ==================== 广告位 ID（示例） ====================
    private static readonly AD_UNIT_IDS = {
        // 激励视频广告
        REWARDED_VIDEO: 'ad_unit_rewarded_video_001',
        
        // 插屏广告
        INTERSTITIAL: 'ad_unit_interstitial_001',
        
        // Banner广告
        BANNER: 'ad_unit_banner_001'
    };

    // ==================== 属性 ====================
    @property
    public testMode: boolean = true;  // 测试模式

    // 运行时广告实例
    private _rewardedVideoAd: any = null;
    private _interstitialAd: any = null;
    private _bannerAd: any = null;

    // 回调处理
    private _onRewardedVideoSuccess: (() => void) | null = null;
    private _onRewardedVideoClose: (() => void) | null = null;
    private _onRewardedVideoError: ((err: any) => void) | null = null;

    // ==================== 生命周期 ====================
    onLoad() {
        // 微信小游戏中初始化广告
        this.initAds();
        console.log('[AdManager] initialized');
    }

    // ==================== 广告初始化 ====================
    
    /**
     * 初始化各类型广告
     */
    private initAds() {
        // 在实际微信小程序环境中：
        // this.initRewardedVideoAd();
        // this.initInterstitialAd();
        // this.initBannerAd();
        
        console.log('[AdManager] Ads initialized (mock mode)');
    }

    /**
     * 初始化激励视频广告
     */
    private initRewardedVideoAd() {
        /* 实际微信小程序代码：
        if (wx.createRewardedVideoAd) {
            this._rewardedVideoAd = wx.createRewardedVideoAd({
                adUnitId: AdManager.AD_UNIT_IDS.REWARDED_VIDEO
            });
            
            this._rewardedVideoAd.onLoad(() => {
                console.log('[AdManager] Rewarded video loaded');
            });
            
            this._rewardedVideoAd.onError((err) => {
                console.error('[AdManager] Rewarded video error:', err);
                if (this._onRewardedVideoError) {
                    this._onRewardedVideoError(err);
                }
            });
            
            this._rewardedVideoAd.onClose((res) => {
                console.log('[AdManager] Rewarded video closed:', res);
                if (res.isEnded && this._onRewardedVideoSuccess) {
                    this._onRewardedVideoSuccess();
                } else if (this._onRewardedVideoClose) {
                    this._onRewardedVideoClose();
                }
            });
        }
        */
    }

    /**
     * 初始化插屏广告
     */
    private initInterstitialAd() {
        /* 实际微信小程序代码：
        if (wx.createInterstitialAd) {
            this._interstitialAd = wx.createInterstitialAd({
                adUnitId: AdManager.AD_UNIT_IDS.INTERSTITIAL
            });
            
            this._interstitialAd.onLoad(() => {
                console.log('[AdManager] Interstitial ad loaded');
            });
            
            this._interstitialAd.onError((err) => {
                console.error('[AdManager] Interstitial ad error:', err);
            });
        }
        */
    }

    /**
     * 初始化Banner广告
     */
    private initBannerAd() {
        /* 实际微信小程序代码：
        if (wx.createBannerAd) {
            this._bannerAd = wx.createBannerAd({
                adUnitId: AdManager.AD_UNIT_IDS.BANNER,
                style: {
                    left: 0,
                    top: 0,
                    width: 300
                }
            });
            
            this._bannerAd.onLoad(() => {
                console.log('[AdManager] Banner ad loaded');
            });
            
            this._bannerAd.onError((err) => {
                console.error('[AdManager] Banner ad error:', err);
            });
        }
        */
    }

    // ==================== 激励视频广告 ====================

    /**
     * 显示激励视频广告
     * @param onSuccess 观看成功（完整观看）回调
     * @param onClose 关闭广告回调（未看完）
     * @param onError 错误回调
     */
    public showRewardedVideoAd(
        onSuccess?: () => void,
        onClose?: () => void,
        onError?: (err: any) => void
    ): void {
        // 保存回调
        this._onRewardedVideoSuccess = onSuccess || null;
        this._onRewardedVideoClose = onClose || null;
        this._onRewardedVideoError = onError || null;

        // 测试模式：直接触发成功
        if (this.testMode) {
            console.log('[AdManager] Test mode: triggering success directly');
            setTimeout(() => {
                if (this._onRewardedVideoSuccess) {
                    this._onRewardedVideoSuccess();
                }
                this._clearCallbacks();
            }, 500);
            return;
        }

        /* 实际微信小程序代码：
        if (this._rewardedVideoAd) {
            this._rewardedVideoAd.show()
                .then(() => {
                    console.log('[AdManager] Rewarded video shown');
                })
                .catch((err) => {
                    console.error('[AdManager] Failed to show rewarded video:', err);
                    if (this._onRewardedVideoError) {
                        this._onRewardedVideoError(err);
                    }
                });
        } else {
            console.warn('[AdManager] Rewarded video ad not loaded');
            // 尝试重新加载
            this.initRewardedVideoAd();
        }
        */
    }

    /**
     * 预加载激励视频广告
     */
    public preloadRewardedVideoAd(): void {
        /* 实际微信小程序代码：
        if (this._rewardedVideoAd) {
            this._rewardedVideoAd.load()
                .then(() => {
                    console.log('[AdManager] Rewarded video preloaded');
                })
                .catch((err) => {
                    console.error('[AdManager] Failed to preload rewarded video:', err);
                });
        }
        */
    }

    // ==================== 插屏广告 ====================

    /**
     * 显示插屏广告
     */
    public showInterstitialAd(): void {
        if (this.testMode) {
            console.log('[AdManager] Test mode: interstitial ad would show');
            return;
        }

        /* 实际微信小程序代码：
        if (this._interstitialAd) {
            this._interstitialAd.show()
                .then(() => {
                    console.log('[AdManager] Interstitial ad shown');
                })
                .catch((err) => {
                    console.error('[AdManager] Failed to show interstitial:', err);
                });
        }
        */
    }

    /**
     * 检查是否可以显示插屏广告
     * 微信限制插屏广告展示间隔
     */
    public canShowInterstitial(): boolean {
        // 实际需要记录上次展示时间
        return true;
    }

    // ==================== Banner广告 ====================

    /**
     * 显示Banner广告
     */
    public showBannerAd(): void {
        if (this.testMode) {
            console.log('[AdManager] Test mode: banner ad would show');
            return;
        }

        /* 实际微信小程序代码：
        if (this._bannerAd) {
            this._bannerAd.show()
                .then(() => {
                    console.log('[AdManager] Banner ad shown');
                })
                .catch((err) => {
                    console.error('[AdManager] Failed to show banner:', err);
                });
        }
        */
    }

    /**
     * 隐藏Banner广告
     */
    public hideBannerAd(): void {
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    }

    /**
     * 调整Banner广告位置
     */
    public resizeBannerAd(options: { left?: number; top?: number; width?: number }): void {
        if (this._bannerAd) {
            this._bannerAd.style.left = options.left ?? this._bannerAd.style.left;
            this._bannerAd.style.top = options.top ?? this._bannerAd.style.top;
            if (options.width) {
                this._bannerAd.style.width = options.width;
            }
        }
    }

    // ==================== 辅助方法 ====================

    /**
     * 清除所有回调
     */
    private _clearCallbacks(): void {
        this._onRewardedVideoSuccess = null;
        this._onRewardedVideoClose = null;
        this._onRewardedVideoError = null;
    }

    /**
     * 获取广告是否可用
     */
    public isAdAvailable(): boolean {
        return this._rewardedVideoAd !== null;
    }

    /**
     * 获取eCPM估算（用于调试）
     */
    public getEstimatedECPM(): number {
        // 测试模式返回默认值
        if (this.testMode) {
            return 100; // ¥100 per 1000 impressions
        }
        return 0;
    }
}
