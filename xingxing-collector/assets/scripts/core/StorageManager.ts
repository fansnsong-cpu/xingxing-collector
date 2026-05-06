import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 存储管理器
 * 负责玩家数据的本地持久化
 */
@ccclass('StorageManager')
export class StorageManager extends Component {

    // Storage keys
    private static readonly PLAYER_DATA_KEY = 'xingxing_player_data';
    private static readonly SETTINGS_KEY = 'xingxing_settings';

    /**
     * 加载玩家数据
     */
    public loadPlayerData(): any {
        try {
            const dataStr = localStorage.getItem(StorageManager.PLAYER_DATA_KEY);
            if (dataStr) {
                return JSON.parse(dataStr);
            }
        } catch (e) {
            console.error('[StorageManager] Failed to load player data:', e);
        }
        
        // 返回默认数据
        return this.getDefaultPlayerData();
    }

    /**
     * 保存玩家数据
     */
    public savePlayerData(data: any): void {
        try {
            localStorage.setItem(StorageManager.PLAYER_DATA_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[StorageManager] Failed to save player data:', e);
        }
    }

    /**
     * 获取默认玩家数据
     */
    private getDefaultPlayerData(): any {
        return {
            coins: 100,          // 初始金币
            level: 1,            // 从第1关开始
            characters: {},      // 初始无角色
            house: {
                floor: 1,
                wall: 1,
                furniture: []
            },
            stats: {
                totalScore: 0,
                totalPlayTime: 0,
                charactersCollected: 0
            }
        };
    }

    /**
     * 加载设置
     */
    public loadSettings(): any {
        try {
            const dataStr = localStorage.getItem(StorageManager.SETTINGS_KEY);
            if (dataStr) {
                return JSON.parse(dataStr);
            }
        } catch (e) {
            console.error('[StorageManager] Failed to load settings:', e);
        }
        
        return this.getDefaultSettings();
    }

    /**
     * 保存设置
     */
    public saveSettings(settings: any): void {
        try {
            localStorage.setItem(StorageManager.SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('[StorageManager] Failed to save settings:', e);
        }
    }

    /**
     * 获取默认设置
     */
    private getDefaultSettings(): any {
        return {
            musicEnabled: true,
            soundEnabled: true,
            musicVolume: 0.8,
            soundVolume: 1.0,
            vibrationEnabled: true
        };
    }

    /**
     * 清除所有数据
     */
    public clearAllData(): void {
        try {
            localStorage.removeItem(StorageManager.PLAYER_DATA_KEY);
            localStorage.removeItem(StorageManager.SETTINGS_KEY);
            console.log('[StorageManager] All data cleared');
        } catch (e) {
            console.error('[StorageManager] Failed to clear data:', e);
        }
    }
}
