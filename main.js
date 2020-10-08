$(function(){
    $("#chart").dxChart({
        palette: "soft",
        dataSource: dataSource,
        rotated: true,
        

        customizeLabel: function () {
            if (this.value) {
                return {
                    visible: true,
                    backgroundColor: "none",
                                      
                    customizeText: function () {
                        return this.valueText
                    }
                };
            }
        },
        commonSeriesSettings: {
            ignoreEmptyPoints: true,
            argumentField: "state",
            
            
            type: "bar"
        },
        
        series: [
            { valueField: "dark", name: "Данные по состоянию на дд.мм.ГГГГ",  color: 'rgb(64,112,128)' },
            { valueField: "light", name: "Данные по состоянию на дд.мм.гггг",color: 'rgb(112,208,224)'},
            
            
        ],
        valueAxis: {
            
            tick: {
                visible: false
            },
            label: {
                visible: false,
            },
        grid: {
            visible: false
        }},
        argumentAxis:{
            HorizontalAlignment: "left",
        },
            
        legend: {
            visible: false,
            position: "outside",
            margin:{
                top:0,
                left: 150
            },
            verticalAlignment: "top",
            horizontalAlignment: "center",
            itemTextPosition:'right',
            orientation: 'vertical',
            
            customizeItems: function(items) {
                return items.sort(function(a, b) {
                    if(a.id==1) return -1;
                    if(a.id==0) return 1;
                    return 0;
                });
            }
        },
        
        "export": {
            enabled: false
        },
        // title:{
        // text: "СОВОКУПНАЯ НАЛОГОВАЯ \n НАГРУЗКА",
        // horizontalAlignment: 'left',
        // font: {
        //     color: "black",
        //     weight: 'bold',
            

        // }
        
    // }
    });
    $("#chart").dxChart(
       
        

    );
});