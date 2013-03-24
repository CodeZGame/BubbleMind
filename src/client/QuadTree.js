
function QuadTree(rect, levelLimit)
{
    this._area = rect;
    this._topLeft = 0;
    this._topRight = 0;
    this._bottomLeft = 0;
    this._bottomRight = 0;
    this._empty = true;
    this._levelLimit = levelLimit;
    this._bubbles = new Array();
}

QuadTree.prototype.addBubble = function(bubble)
{
    if (this.intersect(bubble))
    {
        this._empty = false;
        if (this._instantiateQuads())
        {
            if (this._topLeft.addBubble(bubble))
                return (true);
            if (this._topRight.addBubble(bubble))
                return (true);
            if (this._bottomLeft.addBubble(bubble))
                return (true);
            if (this._bottomRight.addBubble(bubble))
                return (true);
        }
        this._bubbles.push(bubble);
        return (true);
    }
    return (false);
};

QuadTree.prototype.handleCollides = function(mouse)
{
    var list = new Array();
    if (this._empty === false
            && mouse.x >= this._area.x && mouse.x <= this._area.x + this._area.width
            && mouse.y >= this._area.y && mouse.y <= this._area.y + this._area.height)
        for (var i = 0; i < this._bubbles.length; i++)
        {
            if (this._mouseIsIn(i, mouse))
            {
                list.push(this._bubbles[i]);
            }
        }
    if (this._topLeft)
        list = list.concat(this._topLeft.handleCollides(mouse));
    if (this._topRight)
        list = list.concat(this._topRight.handleCollides(mouse));
    if (this._bottomLeft)
        list = list.concat(this._bottomLeft.handleCollides(mouse));
    if (this._bottomRight)
        list = list.concat(this._bottomRight.handleCollides(mouse));
    return list;
};

QuadTree.prototype._mouseIsIn = function(i, mouse)
{
    var disX = this._bubbles[i].posX - mouse.x;
    var disY = this._bubbles[i].posY - mouse.y;
    if (mouse.x < this._bubbles[i].posX - (this._bubbles[i].size / 2)
            || mouse.x > this._bubbles[i].posX + (this._bubbles[i].size / 2))
        return false;
    if (mouse.y < this._bubbles[i].posY - (this._bubbles[i].size / 2)
            || mouse.y > this._bubbles[i].posY + (this._bubbles[i].size / 2))
        return false;
    if (Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2)) < (this._bubbles[i].size / 2))
        return true;
    return false;
};

QuadTree.prototype.intersect = function(bubble)
{
    if (bubble.posX - (bubble.size / 2) > this._area.x && bubble.posX + (bubble.size / 2) < this._area.x + this._area.width
            && bubble.posY - (bubble.size / 2) > this._area.y && bubble.posY + (bubble.size / 2) < this._area.y + this._area.height)
        return (true);
    return (false);
};

QuadTree.prototype._instantiateQuads = function()
{
    //  alert(this._levelLimit);
    if (this._levelLimit === 0)
        return (false);
    if (!this._topLeft)
    {
        this._topLeft = new QuadTree({
            x: this._area.x,
            y: this._area.y,
            width: this._area.width / 2,
            height: this._area.height / 2
        },
        this._levelLimit - 1);
    }
    if (!this._topRight)
    {
        this._topRight = new QuadTree({
            x: this._area.x + this._area.width / 2,
            y: this._area.y,
            width: this._topLeft._area.width,
            height: this._topLeft._area.height
        },
        this._levelLimit - 1);
    }
    if (!this._bottomLeft)
    {
        this._bottomLeft = new QuadTree({
            x: this._area.x,
            y: this._area.y + this._area.height / 2,
            width: this._topLeft._area.width,
            height: this._topLeft._area.height
        },
        this._levelLimit - 1);
    }
    if (!this._bottomRight)
    {
        this._bottomRight = new QuadTree({
            x: this._area.x + this._area.width / 2,
            y: this._area.y + this._area.height / 2,
            width: this._topLeft._area.width,
            height: this._topLeft._area.height
        },
        this._levelLimit - 1);
    }
    return (true);
};


