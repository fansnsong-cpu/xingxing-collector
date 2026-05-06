import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 音频管理器
 * 负责背景音乐和音效播放
 */
@ccclass('AudioManager')
export class AudioManager extends Component {

    // ==================== 音频资源路径 ====================
    private static readonly AUDIO_PATH = {
        // 背景音乐
        BGM_MENU: 'audio/bgm_menu',
        BGM_GAME: 'audio/bgm_game',
        BGM_HOUSE: 'audio/bgm_house',
        
        // 音效
        SFX_MATCH: 'audio/sfx_match',
        SFX_SKILL: 'audio/sfx_skill',
        SFX_LEVEL_UP: 'audio/sfx_level_up',
        SFX_BUTTON: 'audio/sfx_button',
        SFX_GASHAPON: 'audio/sfx_gashapon',
        SFX_WIN: 'audio/sfx_win',
        SFX_LOSE: 'audio/sfx_lose',
        SFX_COIN: 'audio/sfx_coin'
    };

    // ==================== 属性 ====================
    @property
    public musicEnabled: boolean = true;

    @property
    public soundEnabled: boolean = true;

    @property({ range: [0, 1, 0.1] })
    public musicVolume: number = 0.8;

    @property({ range: [0, 1, 0.1] })
    public soundVolume: number = 1.0;

    // 运行时
    private _currentBgm: string = '';
    private _bgmAudioId: number = -1;
    private _sfxAudioIds: Map<string, number> = new Map();

    // ==================== 生命周期 ====================
    onLoad() {
        // 加载设置
        this.loadAudioSettings();
        
        console.log('[AudioManager] initialized');
    }

    // ==================== 背景音乐 ====================
    
    /**
     * 播放背景音乐
     */
    public playBgm(bgmName: string = AudioManager.AUDIO_PATH.BGM_GAME) {
        if (!this.musicEnabled) return;
        
        // 如果是同一首BGM，不重复播放
        if (this._currentBgm === bgmName && this._bgmAudioId !== -1) {
            return;
        }

        this.stopBgm();
        this._currentBgm = bgmName;

        // 由于微信小游戏使用原生音频，这里用占位处理
        console.log(`[AudioManager] Playing BGM: ${bgmName}`);
        
        // 实际项目中：
        // cc.audioEngine.play(bgmPath, true, this.musicVolume);
    }

    /**
     * 停止背景音乐
     */
    public stopBgm() {
        if (this._bgmAudioId !== -1) {
            // cc.audioEngine.stop(this._bgmAudioId);
            this._bgmAudioId = -1;
        }
        this._currentBgm = '';
    }

    /**
     * 暂停背景音乐
     */
    public pauseBgm() {
        if (this._bgmAudioId !== -1) {
            // cc.audioEngine.pause(this._bgmAudioId);
        }
    }

    /**
     * 恢复背景音乐
     */
    public resumeBgm() {
        if (this._bgmAudioId !== -1) {
            // cc.audioEngine.resume(this._bgmAudioId);
        }
    }

    /**
     * 设置背景音乐音量
     */
    public setBgmVolume(volume: number) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this._bgmAudioId !== -1) {
            // cc.audioEngine.setVolume(this._bgmAudioId, this.musicVolume);
        }
    }

    // ==================== 音效 ====================

    /**
     * 播放音效
     */
    public playSfx(sfxName: string) {
        if (!this.soundEnabled) return;

        console.log(`[AudioManager] Playing SFX: ${sfxName}`);
        
        // 实际项目中：
        // const audioId = cc.audioEngine.play(sfxPath, false, this.soundVolume);
        // this._sfxAudioIds.set(sfxName, audioId);
    }

    /**
     * 停止指定音效
     */
    public stopSfx(sfxName: string) {
        const audioId = this._sfxAudioIds.get(sfxName);
        if (audioId !== undefined) {
            // cc.audioEngine.stop(audioId);
            this._sfxAudioIds.delete(sfxName);
        }
    }

    /**
     * 停止所有音效
     */
    public stopAllSfx() {
        this._sfxAudioIds.forEach((audioId) => {
            // cc.audioEngine.stop(audioId);
        });
        this._sfxAudioIds.clear();
    }

    /**
     * 设置音效音量
     */
    public setSfxVolume(volume: number) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    // ==================== 便捷方法 ====================

    /**
     * 播放匹配音效（消除成功）
     */
    public playMatchSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_MATCH);
    }

    /**
     * 播放技能音效
     */
    public playSkillSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_SKILL);
    }

    /**
     * 播放升级音效
     */
    public playLevelUpSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_LEVEL_UP);
    }

    /**
     * 播放按钮点击音效
     */
    public playButtonSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_BUTTON);
    }

    /**
     * 播放扭蛋音效
     */
    public playGashaponSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_GASHAPON);
    }

    /**
     * 播放胜利音效
     */
    public playWinSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_WIN);
    }

    /**
     * 播放失败音效
     */
    public playLoseSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_LOSE);
    }

    /**
     * 播放金币音效
     */
    public playCoinSound() {
        this.playSfx(AudioManager.AUDIO_PATH.SFX_COIN);
    }

    // ==================== 设置管理 ====================

    /**
     * 加载音频设置
     */
    private loadAudioSettings() {
        try {
            const settings = localStorage.getItem('xingxing_settings');
            if (settings) {
                const data = JSON.parse(settings);
                this.musicEnabled = data.musicEnabled ?? true;
                this.soundEnabled = data.soundEnabled ?? true;
                this.musicVolume = data.musicVolume ?? 0.8;
                this.soundVolume = data.soundVolume ?? 1.0;
            }
        } catch (e) {
            console.warn('[AudioManager] Failed to load audio settings');
        }
    }

    /**
     * 保存音频设置
     */
    public saveAudioSettings() {
        try {
            localStorage.setItem('xingxing_settings', JSON.stringify({
                musicEnabled: this.musicEnabled,
                soundEnabled: this.soundEnabled,
                musicVolume: this.musicVolume,
                soundVolume: this.soundVolume
            }));
        } catch (e) {
            console.warn('[AudioManager] Failed to save audio settings');
        }
    }

    /**
     * 切换音乐开关
     */
    public toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.resumeBgm();
        } else {
            this.pauseBgm();
        }
        this.saveAudioSettings();
    }

    /**
     * 切换音效开关
     */
    public toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveAudioSettings();
    }
}
