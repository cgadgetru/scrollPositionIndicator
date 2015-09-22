$(function(){


    var winHeight = $(window).height(),
        docHeight = $(document).height(),
        progressBar = $('progress'),
        max, value;

    /* Set the max scrollable area */
    max = docHeight - winHeight;
    progressBar.attr('max', max);

    Snap.plugin( function( Snap, Element, Paper, global ) {

        Element.prototype.globalToLocal = function( globalPoint ) {
            var globalToLocal = this.node.getTransformToElement( this.paper.node ).inverse();
            globalToLocal.e = globalToLocal.f = 0;
            return globalPoint.matrixTransform( globalToLocal );
        };

        Element.prototype.getCursorPoint = function( x, y ) {
            var pt = this.paper.node.createSVGPoint();
            pt.x = x; pt.y = y;
            return pt.matrixTransform( this.paper.node.getScreenCTM().inverse());
        }

        Element.prototype.limitDrag = function( params ) {
            this.data('dragParams', params );
            return this.drag( limitMoveDrag, limitStartDrag );
        };

        function limitMoveDrag( dx, dy, ax, ay ) {
            var params = this.data('dragParams');
            var cursorPoint = this.getCursorPoint( ax, ay );
            var pt = this.paper.node.createSVGPoint();
            var ibb = this.data('ibb');

            pt.x = cursorPoint.x - this.data('op').x;
            pt.y = cursorPoint.y - this.data('op').y;

            if( ibb.x2 + pt.x > params.maxx ) { pt.x = params.maxx - ibb.x2; }
            if( ibb.y2 + pt.y > params.maxy ) { pt.y = params.maxy - ibb.y2; }
            if( ibb.x + pt.x < params.minx ) { pt.x = params.minx - ibb.x; }
            if( ibb.y + pt.y < params.miny ) { pt.y = params.miny - ibb.y; }

            var localPt = this.globalToLocal( pt );

            this.transform( this.data('ot').toTransformString() + "t" + [  localPt.x, localPt.y ] );
        };



        function limitStartDrag( x, y, ev ) {
            this.data('ibb', this.getBBox());
            this.data('op', this.getCursorPoint( x, y ));
            this.data('ot', this.transform().localMatrix);
        };
    });




    var dotRadius = 5,contanerWidth,
       progresLineWidth,progressLineHeight;

    contanerWidth = $('#svg').parent().width();
    progresLineWidth = contanerWidth - dotRadius*2;

    console.log('container width',contanerWidth);

    var s = Snap('#svg');

    s.attr({
        width:'100%',
        height:20
    })
    var line = s.rect(0,0,progresLineWidth,5,3,3);
    line.attr({
        fill:'gray'
    });
    line.transform('translate('+dotRadius+',0)');
    var dot = s.circle(dotRadius,2,dotRadius);
    s.attr({
       stroke:'none',
       fill:'red'
    })
    var group = s.g(line,dot);

    group.attr({
        width:'100%',
        height:20
    })

    group.transform('translate(0,8)');

    var stopPoints = $('.stop-point'), pointPositions = [];

    pointPositions = $.map(stopPoints ,function(el){
        return $(el).offset().top
    });
    console.log('pointPos 1',pointPositions);

    pointPositions = $.map(pointPositions,function(el){
        var part = getPart(max,el);
        console.log('part',part);

        return getPosition(progresLineWidth, part);

    });

    $.map(pointPositions,function(el){
        group.add(s.circle(el,2,5))
    });

    console.log('pointPos 2',pointPositions);

    var dragCircle = s.circle(0,2,9).limitDrag({ x: 0, y: -6, minx: 0, miny: -6, maxx: progresLineWidth+6, maxy: 0 });
    dragCircle.attr({
        fill:'green'
    });
    var animationCircle = s.circle(0,2,9);
    group.add(dragCircle,animationCircle);

    function getPosition(width,part){
        return Math.floor(width * part);
    }
    function getPart(width,topPos){
        return topPos/width;
    }

    var factor = progresLineWidth/max;

    console.log("factor",progresLineWidth, max, factor);

    $(document).on('scroll', function(){
        value = $(window).scrollTop();
        var correctFactor = 83;
        correctValue = (value + correctFactor) * factor;
        console.log('value',value * factor);
        animationCircle.animate({
            transform:'translate('+correctValue+',0)'
        },500,mina.linear)

    });
});