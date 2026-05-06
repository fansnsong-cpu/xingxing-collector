import { _decorator, Component, Node, Color } from 'cc';
import { GameManager, GameState } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 棋盘网格位置
 */
export interface GridPos {
    row: number;
    col: number;
}

/**
 * 棋盘元素类型
 */
export interface BoardItem {
    id: string;          // 角色ID
    configId: string;    // 配置ID
    star: number;         // 星级
    node: Node | null;    // 对应的节点
    pos: GridPos;        // 当前位置
    targetPos: GridPos;  // 目标位置
    isAnimating: boolean; // 是否正在动画中
    isMatched: boolean;   // 是否已匹配待消除
}

/**
 * 消除特效类型
 */
export enum MatchEffect {
    NORMAL,      // 普通消除
    HORIZONTAL,  // 横向一行
    VERTICAL,    // 纵向一列
    BOMB,        // 3x3范围
    SKILL        // 技能特效
}

/**
 * 棋盘管理
 * 负责消消乐游戏的核心逻辑
 */
@ccclass('Board')
export class Board extends Component {

    // ==================== 棋盘配置 ====================
    @property
    public rows: number = 8;           // 行数

    @property
    public cols: number = 8;           // 列数

    @property
    public cellSize: number = 80;      // 格子大小（像素）

    @property
    public cellSpacing: number = 4;    // 格子间距

    @property({ type: Node })
    public boardRoot: Node | null = null;  // 棋盘根节点

    @property({ type: Node })
    public itemPrefab: Node | null = null; // 元素预制体

    // ==================== 运行时数据 ====================
    private _grid: BoardItem[][] = [];  // 棋盘网格
    private _selectedItem: BoardItem | null = null;  // 当前选中元素
    private _isProcessing: boolean = false;  // 是否正在处理动画
    private _comboCount: number = 0;    // 连击计数

    // ==================== 生命周期 ====================
    onLoad() {
        console.log('[Board] onLoad');
    }

    start() {
        console.log('[Board] start');
        // 初始化棋盘
        this.initBoard();
    }

    // ==================== 棋盘初始化 ====================

    /**
     * 初始化棋盘
     */
    public initBoard(): void {
        console.log('[Board] Initializing board...');
        
        // 清除旧数据
        this._grid = [];
        this._selectedItem = null;
        this._isProcessing = false;
        this._comboCount = 0;

        // 创建新网格
        for (let row = 0; row < this.rows; row++) {
            this._grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this._grid[row][col] = this.createEmptyItem(row, col);
            }
        }

        // 生成初始元素（确保没有初始匹配）
        this.generateInitialItems();

        // 渲染棋盘
        this.renderBoard();

        console.log('[Board] Board initialized');
    }

    /**
     * 创建空元素占位
     */
    private createEmptyItem(row: number, col: number): BoardItem {
        return {
            id: '',
            configId: '',
            star: 0,
            node: null,
            pos: { row, col },
            targetPos: { row, col },
            isAnimating: false,
            isMatched: false
        };
    }

    /**
     * 生成初始元素（避免匹配）
     */
    private generateInitialItems(): void {
        const configs = GameManager.getCharacterConfigs();
        const characterIds = configs.map(c => c.id);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let configId: string;
                let attempts = 0;

                // 避免初始匹配
                do {
                    configId = characterIds[Math.floor(Math.random() * characterIds.length)];
                    attempts++;
                } while (this.wouldMatch(row, col, configId) && attempts < 50);

                this._grid[row][col].configId = configId;
                this._grid[row][col].star = 1;  // 初始1星
            }
        }
    }

    /**
     * 检查是否会产生匹配
     */
    private wouldMatch(row: number, col: number, configId: string): boolean {
        // 检查横向
        if (col >= 2) {
            if (this._grid[row][col - 1].configId === configId &&
                this._grid[row][col - 2].configId === configId) {
                return true;
            }
        }

        // 检查纵向
        if (row >= 2) {
            if (this._grid[row - 1][col].configId === configId &&
                this._grid[row - 2][col].configId === configId) {
                return true;
            }
        }

        return false;
    }

    // ==================== 棋盘渲染 ====================

    /**
     * 渲染棋盘
     */
    private renderBoard(): void {
        if (!this.boardRoot) {
            console.error('[Board] boardRoot is null!');
            return;
        }

        // 清除旧节点
        this.boardRoot.removeAllChildren();

        // 创建元素节点
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const item = this._grid[row][col];
                if (item.configId) {
                    this.createItemNode(item);
                }
            }
        }

        console.log(`[Board] Rendered ${this.rows}x${this.cols} board`);
    }

    /**
     * 创建元素节点
     */
    private createItemNode(item: BoardItem): Node {
        if (!this.itemPrefab || !this.boardRoot) return new Node();

        // 克隆预制体
        const node = this.itemPrefab.clone();
        node.setParent(this.boardRoot);

        // 设置位置
        const worldPos = this.gridToWorld(item.pos.row, item.pos.col);
        node.setPosition(worldPos.x, worldPos.y, 0);

        // 设置可见
        node.active = true;

        // 更新引用
        item.node = node;

        // 设置角色外观
        this.updateItemVisual(item);

        // 添加点击事件
        this.addItemClickHandler(node, item);

        return node;
    }

    /**
     * 更新元素视觉
     */
    private updateItemVisual(item: BoardItem): void {
        if (!item.node) return;

        // 获取角色配置
        const configs = GameManager.getCharacterConfigs();
        const config = configs.find(c => c.id === item.configId);

        if (config) {
            // 设置颜色（实际项目中应该是精灵图）
            // 这里用颜色模拟
            const color = new Color(config.color);
            // item.node.getComponent(Sprite).color = color;
            
            // 设置名称便于调试
            item.node.name = `item_${config.name}_${item.pos.row}_${item.pos.col}`;
        }
    }

    /**
     * 网格坐标转世界坐标
     */
    public gridToWorld(row: number, col: number): { x: number, y: number } {
        const boardWidth = this.cols * (this.cellSize + this.cellSpacing);
        const boardHeight = this.rows * (this.cellSize + this.cellSpacing);
        
        const startX = -boardWidth / 2 + this.cellSize / 2;
        const startY = boardHeight / 2 - this.cellSize / 2;

        return {
            x: startX + col * (this.cellSize + this.cellSpacing),
            y: startY - row * (this.cellSize + this.cellSpacing)
        };
    }

    // ==================== 点击处理 ====================

    /**
     * 添加元素点击处理
     */
    private addItemClickHandler(node: Node, item: BoardItem): void {
        // node.on(Node.EventType.TOUCH_END, () => {
        //     this.onItemClick(item);
        // });
        
        // 模拟点击（开发测试用）
        node.on('click', () => {
            this.onItemClick(item);
        });
    }

    /**
     * 元素被点击
     */
    private onItemClick(item: BoardItem): void {
        // 如果正在处理动画，忽略点击
        if (this._isProcessing) return;

        // 如果是不同状态
        const gameState = GameManager.instance.state;
        if (gameState !== GameState.PLAYING) return;

        console.log(`[Board] Item clicked: ${item.configId} at (${item.pos.row}, ${item.pos.col})`);

        // 如果没有选中元素，选中它
        if (!this._selectedItem) {
            this.selectItem(item);
            return;
        }

        // 如果点击的是同一个元素，取消选中
        if (this._selectedItem === item) {
            this.deselectItem();
            return;
        }

        // 检查是否相邻
        if (this.areAdjacent(this._selectedItem.pos, item.pos)) {
            // 交换元素
            this.swapItems(this._selectedItem, item);
        } else {
            // 不相邻，选中新元素
            this.deselectItem();
            this.selectItem(item);
        }
    }

    /**
     * 选中元素
     */
    private selectItem(item: BoardItem): void {
        this._selectedItem = item;
        
        // 添加选中特效（缩放）
        if (item.node) {
            // item.node.setScale(1.1, 1.1);
            console.log(`[Board] Selected: ${item.configId}`);
        }
    }

    /**
     * 取消选中
     */
    private deselectItem(): void {
        if (this._selectedItem && this._selectedItem.node) {
            // 恢复原大小
            // this._selectedItem.node.setScale(1, 1);
        }
        this._selectedItem = null;
    }

    /**
     * 检查两个位置是否相邻
     */
    private areAdjacent(pos1: GridPos, pos2: GridPos): boolean {
        const rowDiff = Math.abs(pos1.row - pos2.row);
        const colDiff = Math.abs(pos1.col - pos2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    // ==================== 交换与匹配 ====================

    /**
     * 交换两个元素
     */
    private async swapItems(item1: BoardItem, item2: BoardItem): Promise<void> {
        console.log(`[Board] Swapping: (${item1.pos.row},${item1.pos.col}) <-> (${item2.pos.row},${item2.pos.col})`);
        
        this._isProcessing = true;
        this.deselectItem();

        // 交换网格数据
        this.swapInGrid(item1, item2);

        // 播放动画
        await this.animateSwap(item1, item2);

        // 检查是否有匹配
        const matches = this.findAllMatches();
        
        if (matches.length > 0) {
            // 有匹配，处理消除
            this._comboCount = 0;
            await this.processMatches(matches);
        } else {
            // 没有匹配，交换回去
            console.log('[Board] No match, swapping back');
            this.swapInGrid(item1, item2);
            await this.animateSwap(item1, item2);
        }

        this._isProcessing = false;

        // 消耗步数
        GameManager.instance.useMove();
    }

    /**
     * 在网格中交换两个元素
     */
    private swapInGrid(item1: BoardItem, item2: BoardItem): void {
        const tempConfigId = item1.configId;
        const tempStar = item1.star;
        
        item1.configId = item2.configId;
        item1.star = item2.star;
        
        item2.configId = tempConfigId;
        item2.star = tempStar;

        // 更新位置引用
        item1.pos = { ...item1.targetPos };
        item2.pos = { ...item2.targetPos };
    }

    /**
     * 播放交换动画
     */
    private animateSwap(item1: BoardItem, item2: BoardItem): Promise<void> {
        return new Promise((resolve) => {
            if (item1.node && item2.node) {
                const pos1 = this.gridToWorld(item1.pos.row, item1.pos.col);
                const pos2 = this.gridToWorld(item2.pos.row, item2.pos.col);

                // 简单的位移动画（实际项目使用tween）
                // item1.node.setPosition(pos2.x, pos2.y, 0);
                // item2.node.setPosition(pos1.x, pos1.y, 0);

                console.log(`[Board] Swap animation: moving to (${pos1.x},${pos1.y}) and (${pos2.x},${pos2.y})`);
            }
            
            // 模拟动画时间
            setTimeout(resolve, 200);
        });
    }

    // ==================== 匹配检测与处理 ====================

    /**
     * 查找所有匹配
     */
    private findAllMatches(): BoardItem[][] {
        const matches: BoardItem[][] = [];
        const visited: boolean[][] = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));

        // 检查横向匹配
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 2; col++) {
                const match = this.findHorizontalMatch(row, col, visited);
                if (match.length >= 3) {
                    matches.push(match);
                }
            }
        }

        // 检查纵向匹配
        for (let row = 0; row < this.rows - 2; row++) {
            for (let col = 0; col < this.cols; col++) {
                const match = this.findVerticalMatch(row, col, visited);
                if (match.length >= 3) {
                    matches.push(match);
                }
            }
        }

        return matches;
    }

    /**
     * 查找横向匹配
     */
    private findHorizontalMatch(row: number, startCol: number, visited: boolean[][]): BoardItem[] {
        const configId = this._grid[row][startCol].configId;
        if (!configId) return [];

        const match: BoardItem[] = [];
        let col = startCol;

        while (col < this.cols && this._grid[row][col].configId === configId) {
            if (!visited[row][col]) {
                match.push(this._grid[row][col]);
                visited[row][col] = true;
            }
            col++;
        }

        return match;
    }

    /**
     * 查找纵向匹配
     */
    private findVerticalMatch(startRow: number, col: number, visited: boolean[][]): BoardItem[] {
        const configId = this._grid[startRow][col].configId;
        if (!configId) return [];

        const match: BoardItem[] = [];
        let row = startRow;

        while (row < this.rows && this._grid[row][col].configId === configId) {
            if (!visited[row][col]) {
                match.push(this._grid[row][col]);
                visited[row][col] = true;
            }
            row++;
        }

        return match;
    }

    /**
     * 处理匹配（消除、新增、掉落）
     */
    private async processMatches(matches: BoardItem[][]): Promise<void> {
        this._comboCount++;
        
        console.log(`[Board] Processing matches: ${matches.length} matches, combo: ${this._comboCount}`);

        // 计算得分
        let score = 0;
        let totalItems = 0;

        for (const match of matches) {
            totalItems += match.length;
            
            // 基础得分：匹配数量 * 10 * 连击加成
            score += match.length * 10 * this._comboCount;

            // 标记为已匹配
            for (const item of match) {
                item.isMatched = true;
            }
        }

        // 播放消除特效
        await this.playMatchEffect(matches);

        // 播放音效
        GameManager.instance.audioManager?.playMatchSound();

        // 更新分数
        GameManager.instance.addScore(score);

        // 消除元素
        this.removeMatchedItems();

        // 掉落新元素
        await this.dropNewItems();

        // 检查是否有新的匹配（连锁）
        const newMatches = this.findAllMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches);
        }
    }

    /**
     * 播放匹配特效
     */
    private playMatchEffect(matches: BoardItem[][]): Promise<void> {
        return new Promise((resolve) => {
            for (const match of matches) {
                for (const item of match) {
                    if (item.node) {
                        // 播放消除动画
                        console.log(`[Board] Playing match effect at (${item.pos.row}, ${item.pos.col})`);
                    }
                }
            }
            
            setTimeout(resolve, 150);
        });
    }

    /**
     * 移除已匹配的元素
     */
    private removeMatchedItems(): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const item = this._grid[row][col];
                if (item.isMatched) {
                    // 销毁节点
                    if (item.node) {
                        item.node.destroy();
                    }
                    
                    // 清空网格
                    item.configId = '';
                    item.star = 0;
                    item.node = null;
                    item.isMatched = false;
                }
            }
        }
    }

    /**
     * 掉落新元素填充空白
     */
    private async dropNewItems(): Promise<void> {
        // 从下往上遍历，每列处理掉落
        for (let col = 0; col < this.cols; col++) {
            await this.dropColumn(col);
        }

        // 填充新元素
        this.fillEmptyCells();
    }

    /**
     * 处理单列的掉落
     */
    private async dropColumn(col: number): Promise<void> {
        let emptyRow = -1;

        // 从下往上找空位
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this._grid[row][col].configId === '') {
                if (emptyRow === -1) {
                    emptyRow = row;
                }
            } else if (emptyRow !== -1) {
                // 有空位，需要掉落
                const item = this._grid[row][col];
                
                // 移动到空位
                this._grid[emptyRow][col] = item;
                this._grid[row][col] = this.createEmptyItem(row, col);
                
                // 更新位置
                item.pos.row = emptyRow;
                item.targetPos = { row: emptyRow, col };

                // 动画移动
                if (item.node) {
                    const worldPos = this.gridToWorld(emptyRow, col);
                    // item.node.setPosition(worldPos.x, worldPos.y, 0);
                    console.log(`[Board] Dropping item from (${row},${col}) to (${emptyRow},${col})`);
                }

                emptyRow--;
            }
        }
    }

    /**
     * 填充空单元格
     */
    private fillEmptyCells(): void {
        const configs = GameManager.getCharacterConfigs();
        const characterIds = configs.map(c => c.id);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const item = this._grid[row][col];
                if (item.configId === '') {
                    // 随机生成新元素
                    item.configId = characterIds[Math.floor(Math.random() * characterIds.length)];
                    item.star = 1;
                    
                    // 创建节点
                    if (this.boardRoot) {
                        this.createItemNode(item);
                    }
                    
                    console.log(`[Board] Created new item at (${row},${col}): ${item.configId}`);
                }
            }
        }
    }

    // ==================== 技能处理 ====================

    /**
     * 使用技能（特殊消除）
     */
    public async useSkill(skillType: string, centerPos: GridPos): Promise<void> {
        console.log(`[Board] Using skill: ${skillType} at (${centerPos.row}, ${centerPos.col})`);
        
        this._isProcessing = true;

        const configs = GameManager.getCharacterConfigs();
        const centerItem = this._grid[centerPos.row][centerPos.col];
        const centerConfig = configs.find(c => c.id === centerItem.configId);

        let matches: BoardItem[][] = [];

        switch (skillType) {
            case 'sakura':  // 小樱：3x3范围
                matches = this.getSkillAreaMatches(centerPos, 1);
                break;
            case 'moonbear':  // 月宝：整列
                matches = this.getColumnMatches(centerPos.col);
                break;
            case 'starry':  // 星旅：整行
                matches = this.getRowMatches(centerPos.row);
                break;
            case 'bubble':  // 泡泡：周围3x3
                matches = this.getSkillAreaMatches(centerPos, 1);
                break;
            case 'rainbow':  // 彩彩：所有同色
                matches = this.getColorMatches(centerItem.configId);
                break;
            case 'sunset':  // 夕火：全屏低星
                matches = this.getLowStarMatches(centerItem.star);
                break;
        }

        // 播放技能音效
        GameManager.instance.audioManager?.playSkillSound();

        // 处理技能效果
        this._comboCount = 0;
        await this.processMatches(matches);

        this._isProcessing = false;
    }

    /**
     * 获取范围内匹配
     */
    private getSkillAreaMatches(center: GridPos, radius: number): BoardItem[][] {
        const matches: BoardItem[][] = [];
        const matchSet = new Set<BoardItem>();

        for (let r = center.row - radius; r <= center.row + radius; r++) {
            for (let c = center.col - radius; c <= center.col + radius; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    const item = this._grid[r][c];
                    if (item.configId) {
                        matchSet.add(item);
                    }
                }
            }
        }

        if (matchSet.size > 0) {
            matches.push(Array.from(matchSet));
        }

        return matches;
    }

    /**
     * 获取整列匹配
     */
    private getColumnMatches(col: number): BoardItem[][] {
        const match: BoardItem[] = [];
        for (let row = 0; row < this.rows; row++) {
            if (this._grid[row][col].configId) {
                match.push(this._grid[row][col]);
            }
        }
        return match.length > 0 ? [match] : [];
    }

    /**
     * 获取整行匹配
     */
    private getRowMatches(row: number): BoardItem[][] {
        const match: BoardItem[] = [];
        for (let col = 0; col < this.cols; col++) {
            if (this._grid[row][col].configId) {
                match.push(this._grid[row][col]);
            }
        }
        return match.length > 0 ? [match] : [];
    }

    /**
     * 获取同色匹配
     */
    private getColorMatches(configId: string): BoardItem[][] {
        const match: BoardItem[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this._grid[row][col].configId === configId) {
                    match.push(this._grid[row][col]);
                }
            }
        }
        return match.length > 0 ? [match] : [];
    }

    /**
     * 获取低星级匹配
     */
    private getLowStarMatches(maxStar: number): BoardItem[][] {
        const match: BoardItem[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this._grid[row][col].star <= maxStar) {
                    match.push(this._grid[row][col]);
                }
            }
        }
        return match.length > 0 ? [match] : [];
    }

    // ==================== 调试 ====================

    /**
     * 打印棋盘状态
     */
    public printBoard(): void {
        console.log('[Board] Current state:');
        let output = '';
        for (let row = 0; row < this.rows; row++) {
            let rowStr = '';
            for (let col = 0; col < this.cols; col++) {
                const item = this._grid[row][col];
                const char = item.configId ? item.configId.substring(0, 1).toUpperCase() : '.';
                rowStr += char + ' ';
            }
            output += rowStr + '\n';
        }
        console.log(output);
    }
}
