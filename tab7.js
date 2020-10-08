let dataSource_data_x, dataSource1_data_y, dataSource2_data_y;
let now_page = '';

function RedrawGraphs1(q2, year)
{
    document.getElementById('quartal_zoom').style.display = 'block';
    let vx, vy, i, i1, i2, start, tmp, clss;

    if ((i2 = dataSource_data_x.indexOf(q2)) == -1) i2 = dataSource_data_x.length - 1; //Находим индекс конечного квартала (если не найдено - берем последний)
    i1 = (i2 >= 7 ? i2 - 7 : 0); //Находим индекс начального квартала (если не найдено - берем первый)

    //Строим полосу выбора диапазона по кварталам
    let template_button = 
    '<div class="col col-xl-1 pl-1 pr-1 text-center">' +
        '<button type="button" class="btn btn-sm btn-outline-primary w-100__PARAM1__" data-click-function="SetQuarterInterval" data-mouseover-function="SetIntervalOnHover" data-quarter="__PARAM2__">__PARAM3__</button>' + 
    '</div>';

    let html = '';
    start = 1;
    for (i = i1; i <= i2; i++)
    {
        tmp = dataSource_data_x[i].split('-');
        if (tmp[0] == year)
        {
            if (start)
            {
                clss = ' active';
                start = 0;
            }
            else if (i == dataSource_data_x.length - 1 || dataSource_data_x[i + 1].split('-')[0] != year) clss = ' active';
            else clss = ' interval-between-limits';
        }
        else clss = '';

        html += StrReplace(template_button, {
            '__PARAM1__': clss,
            '__PARAM2__': dataSource_data_x[i],
            '__PARAM3__': '<span class="d-none d-md-inline">' + tmp[0][0] + tmp[0][1] + '</span>' + tmp[0][2] + tmp[0][3] + '<br/>' + tmp[1]
        });
    }

    html += '<div class="d-none d-xl-block col-1 text-center th-right">Темп</div><div class="d-none d-xl-block col-1 text-center th-right">Прирост</div>';
    $('#tab7_1_selector div:first').nextAll().remove();
    $('#tab7_1_selector').append(html);
    //---------------

    //Строим HTML для размещения графиков, а потом строим и сами графики (через promise)
    $('#tab7_1_graph').html('');
    dataSource1_data_y.sort((a, b) => {
        return a.graph_data[i2] - b.graph_data[i2];
    })
    for (vy of dataSource1_data_y) //Цикл по регионам
    {
        new Promise(function(resolve, reject) { //Готовим HTML для строки с графиком и показателями по каждому из регионов
            let template = 
            '<div class="row align-items-center mt-2 no-gutters" data-id-region="__PARAM1__" data-click-function="DrillDownRegionAndQuarterInterval">' +
                '<div class="col-6 col-xl-2 order-1 pl-2 pr-2 region-cell">__PARAM2__</div>' +
                '<div class="col-12 col-xl-8 order-4 order-xl-2 w-100 graph-cell" id="chart1-__PARAM1__"></div>' +
                '<div class="col-2 col-xl-1 order-2 order-xl-3 ml-3 ml-xl-0 mb-2 mb-xl-0 text-center value-cell">' +
                    '<span class="d-block d-xl-none value-name">Темп<br/><span class="rel-value"></span></span><span class="d-none d-xl-block rel-value"></span>' +
                '</div>' +
                '<div class="col-2 col-xl-1 order-3 order-xl-4 ml-3 ml-xl-0 mb-2 mb-xl-0 text-center value-cell">' +
                    '<span class="d-block d-xl-none value-name">Прирост<br/><span class="abs-value"></span></span><span class="d-none d-xl-block abs-value"></span>' +
                '</div>' +
            '</div>';

            if ($('#tab7_1_graph').append(StrReplace(template, {
                '__PARAM1__': vy.id_region,
                '__PARAM2__': vy.region
            }))) resolve(vy);
            else
            {
                reject(vy);
            }
        }).then(function(dy) { //HTML готов? Делаем график по региону
            let ds = [], i, i1, i2;

            if ((i1 = dataSource_data_x.indexOf($('#tab7_1_selector button[data-quarter]:first').data('quarter'))) == -1) throw dy.region;
            if ((i2 = dataSource_data_x.indexOf($('#tab7_1_selector button[data-quarter]:last').data('quarter'))) == -1) throw dy.region;
            for (i = i1; i <= i2; i++) ds.push({quarter: dataSource_data_x[i], traditional_indicator: -dy.graph_data[i]}); //Цикл по диапазону кварталов

            let v1 = ds[0].traditional_indicator;
            let v2 = ds[ds.length - 1].traditional_indicator;
            let color = (v2 - v1 > 0 ? '#33bfa3' : (v2 - v1 < 0 ? '#fd3392' : '#2c87d2'));

            $('#chart1-' + dy.id_region).dxChart({
                dataSource: ds,
                series: [
                    {
                        type: 'line',
                        argumentField: 'quarter',
                        valueField: 'traditional_indicator',
                        color: color,
                        label: {
                            visible: true,
                            position: 'outside',
                            backgroundColor: 'none',
                            font: {
                                size: 10,
                                weight: 'normal',
                                color: '#595d6e;'
                            },
                            customizeText: (e) => {
                                return -e.value;
                            }
                        },
                        point: {
                            size: 10,
                            hoverStyle: {
                                size: 6,
                                color: color
                            },
                            border: {
                                color: '#dee3eb',
                                width: 0.5,
                                visible: true
                            }
                        }
                    }
                ],
                argumentAxis: {
                    label: {visible: false},
                    grid:  {
                        visible: true,
                        color: '#ffffff',
                        width: 1
                    },
                    tick:  {visible: false},
                    visible: false
                },
                valueAxis: {
                    maxValueMargin: 0.2,
                    minValueMargin: 0.2,
                    label: {visible: false},
                    grid:  {visible: false},
                    tick:  {visible: false},
                    visible: false
                },
                "export": {enabled: false},
                legend: {visible: false},
                size: {height: 60}
            });
        }).
        catch(function(region) {
            alert('Ошибка построения графика по региону: ' + region);
        });
    }
    //---------------
}

function RedrawGraphs2_1(id_region)
{
    let vy, i, i1, i2, found, tmp, color;

    //Строим полосу выбора диапазона по кварталам
    let html = '';
    let template_button = 
    '<div class="col__PARAM1__ pl-1 pr-1 text-center">' +
        '<button type="button" class="btn btn-sm btn-outline-primary w-100__PARAM2__" data-id-region="__PARAM3__" data-quarter="__PARAM4__" data-click-function="SelectQuarterForRadar">__PARAM5__</button>' + 
    '</div>';

    if ((i1 = dataSource_data_x.indexOf($('#tab7_1_selector button[data-quarter]:first').data('quarter'))) == -1) throw id_region;
    if ((i2 = dataSource_data_x.indexOf($('#tab7_1_selector button[data-quarter]:last').data('quarter'))) == -1) throw id_region;
    for (i = i1; i <= i2; i++)
    {
        html += StrReplace(template_button, {
            '__PARAM1__': (i == i1 ? ' offset-0 offset-xl-3' : ''),
            '__PARAM2__': (i == i2 ? ' active' : ''),
            '__PARAM3__': id_region,
            '__PARAM4__': dataSource_data_x[i],
            '__PARAM5__': '<span class="d-none d-md-inline">' + dataSource_data_x[i][0] + dataSource_data_x[i][1] + '</span>' + dataSource_data_x[i][2] + dataSource_data_x[i][3] + '<br/>' + dataSource_data_x[i].split('-')[1]
        });
    }

    $('#tab7_2_selector').html(html);
    //---------------

    //===============
    //Строим HTML для размещения графиков, а потом строим и сами графики (через promise)
    //===============


    //Эмулируем данные по "нулевому" виду работ - запихиваем туда сводные данные по выбранному региону
    found = 0;
    for (vy of dataSource2_data_y)
    {
        if (vy.id_job == 0)
        {
            found = 1;
            break;
        }
    }

    for (vy of dataSource1_data_y)
    {
        if (vy.id_region == parseInt(id_region))
        {
            tmp = Object.assign({}, vy);
            tmp.id_job = 0;
            tmp.job = 'место в рейтинге';
            delete tmp['id_region'];
            delete tmp['region'];
            break;
        }
    }

    if (!found) dataSource2_data_y.unshift(tmp); else dataSource2_data_y[0] = tmp;
    //---------------

    $('#tab7_2_graph').html('');
    for (vy of dataSource2_data_y) //Цикл по видам работ
    {
        new Promise(function(resolve, reject) { //Готовим HTML для строки с графиком и показателями по каждому из видов работ
            let template = 
            '<div class="row align-items-center mt-2 no-gutters region_for_zoom" data-id-job="__PARAM1__">' +
                '<div class="col-xl-3 job-cell pl-2 pr-2 region-into-graph">__PARAM2__</div>' +
                '<div class="col-xl-9 w-100 graph-cell" id="chart2-__PARAM1__"></div>' +
            '</div>';
            
            if ($('#tab7_2_graph').append(StrReplace(template, {
                '__PARAM1__': vy.id_job,
                '__PARAM2__': vy.job
            }))) resolve(vy);
            else
            {
                reject(vy);
            }
        }).then(function(dy) { //HTML готов? Делаем график
            let ds = [], i, i1, i2, completed, val;

            if ((i1 = dataSource_data_x.indexOf($('#tab7_1_selector button[data-quarter]:first').data('quarter'))) == -1) throw dy.region;
            if ((i2 = dataSource_data_x.indexOf($('#tab7_1_selector button[data-quarter]:last').data('quarter'))) == -1) throw dy.region;
            for (i = i1; i <= i2; i++) //Готовим источник данных для графика. Значения, которые > 100% или < -20%, обрезаем
            {
                if (!dy.id_job) ds.push({
                    quarter: dataSource_data_x[i],
                    traditional_indicator: -dy.graph_data[i]
                });
                else
                {
                    completed = dy.graph_data[i] / dy.norm;
                    if (completed > 1) val = dy.norm;
                    else if (completed < -0.2) val = -dy.norm * 0.2;
                    else val = dy.graph_data[i];

                    ds.push({
                        quarter: dataSource_data_x[i],
                        traditional_indicator: val * 1,
                        traditional_indicator_original: dy.graph_data[i] * 1,
                        norm: dy.norm * 1
                    });
                }
            }

            if (dy.id_job) $('#chart2-' + dy.id_job).dxChart({
                dataSource: ds,
                series: [
                    {
                        type: 'area',
                        argumentField: 'quarter',
                        valueField: 'traditional_indicator',
                        color: 'rgba(44, 135, 210, 1)',
                        point: {
                            size: 10,
                            
                        }
                    }
                ],
                argumentAxis: {
                    label: {visible: false},
                    grid:  {
                        visible: true,
                        color: '#ffffff',
                        width: 1
                    },
                    tick:  {visible: false},
                    visible: false
                },
                valueAxis: {
                    maxValueMargin: 0.1,
                    minValueMargin: 0.1,
                    label: {visible: false},
                    grid:  {visible: false},
                    tick:  {visible: false},
                    visible: false
                },
                tooltip: {
                    enabled: true,
                    customizeTooltip: function (e) {
                        let val_orig = e.point.data.traditional_indicator_original;
                        let percent_completed = Math.floor(val_orig / e.point.data.norm * 100);
                        return {text: val_orig + '\n' + percent_completed + '%'};
                    }
                },
                customizePoint: function (e) {
                    let color;
                    if (e.data.traditional_indicator_original > e.data.traditional_indicator)
                        color = '#39bb9d';
                    else if (e.data.traditional_indicator_original < e.data.traditional_indicator)
                        color = '#ef435a';
                    else color = '#2c87d2';
                    return {
                        color: color,
                        visible: (color != '#2c87d2' ? true : false),
                        hoverStyle: {
                            size: 6,
                            color: color
                        },
                        border: {
                            color: '#dee3eb',
                            width: 0.5,
                            visible: true
                        }
                    };
                },
                'export': {enabled: false},
                legend: {visible: false},
                size: {height: 60}
            });
            else
            {
                $('#chart2-0').dxChart({
                    dataSource: ds,
                    series: [
                        {
                            type: 'line',
                            argumentField: 'quarter',
                            valueField: 'traditional_indicator',
                            color: 'rgba(44, 135, 210, 1)',
                            label: {visible: false},
                            point: {
                                size: 10,
                                hoverStyle: {
                                    size: 6,
                                    color: 'rgba(44, 135, 210, 1)'
                                }
                            }
                        }
                    ],
                    argumentAxis: {
                        label: {visible: false},
                        grid:  {
                            visible: true,
                            color: '#ffffff',
                            width: 1
                        },
                        tick:  {visible: false},
                        visible: false
                    },
                    valueAxis: {
                        maxValueMargin: 0.2,
                        minValueMargin: 0.2,
                        label: {visible: false},
                        grid:  {visible: false},
                        tick:  {visible: false},
                        visible: false
                    },
                    tooltip: {
                        enabled: true,
                        customizeTooltip: function (e) {
                            return {text: `${-e.point.data.traditional_indicator}`};
                        }
                    },
                    'export': {enabled: false},
                    legend: {visible: false},
                    size: {height: 60}
                });

                setTimeout(function() { //...и заодно строим радар по первой кнопке в списке кварталов
                    $('#tab7_2_selector button.active').trigger('click');
                }, 150);
            }
        }).
        catch(function(region) {
            return alert('Ошибка построения графика по виду работ: ');
        });
    }
    //---------------

    //===============
}

function RedrawGraphs2_2(id_region, quarter)
{
    let ds = [], q = '', has_negative = 0, vy, i, val, val_orig;
    document.getElementById('quartal_zoom').style.display = 'block';
            // console.info(document.getElementById('quartal_zoom').style.display);
    //Готовим данные для "радара"
    if ((i = dataSource_data_x.indexOf(quarter)) == -1) return;

    for (vy of dataSource2_data_y)
    {
        if (vy.id_job)
        {
            val_orig = Math.floor(vy.graph_data[i] / vy.norm * 100);
            if (val_orig < -20) val = -20;
            else if (val_orig > 100) val = 100;
            else val = val_orig;
            // let job = now_page == ''? vy.job: vy.job_short
            ds.push({
                'argument': vy.job,
                'value': val,
                'originalValue': val_orig,
                'tooltipData': val_orig
            });

            if (val_orig < 0) has_negative = 1;
        }
    }
    //---------------

    //Константные линии
    let constantLines = [
        {
            label: {
                text: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;50%",
                font: {
                    color: '#ef435a',
                    size: 16,
                    weight: 'bold'
                },
                visible: false
            },
            width: 1,
            value: 50,
            color: '#ef435a',
            dashStyle: "dash",
            extendAxis: true
        },
        {
            label: {
                text: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;75%",
                font: {
                    color: '#f9a01b',
                    size: 16,
                    weight: 'bold'
                },
                visible: false
            },
            width: 1,
            value: 75,
            color: '#f9a01b',
            dashStyle: "dash",
            extendAxis: true
        },
        {
            label: {
                text: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;100%",
                verticalOffset: 10,
                font: {
                    color: '#39bb9d',
                    size: 16,
                    weight: 'bold'
                },
                visible: false
            },
            width: 1,
            value: 100,
            color: '#39bb9d',
            dashStyle: "dash",
            extendAxis: true
        }
    ];

    if (has_negative) constantLines.push({
        label: {
            text: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0%",
            verticalOffset: 10,
            font: {
                color: '#787878',
                size: 16,
                weight: 'bold'
            },
            visible: false
        },
        width: 1,
        value: 0,
        color: '#787878',
        dashStyle: "dash",
        extendAxis: true
    });
    //---------------
    const quart_split = quarter.split('-');
    document.getElementById('quartal_zoom').innerHTML = `${quart_split[1]} КВАРТАЛ ${quart_split[0]}`;
    $(function(){
        $("#zoomedChart").dxPolarChart({
            dataSource: ds,
            commonSeriesSettings: {
                argumentField: "argument",
                closed: false
            },
            resolveLabelOverlapping: 'hide',
            series: [{
                    type: "bar",
                    name: "Test results",
                    valueField: "value",
                    color: '#7DA7C7'
                }
            ],
            argumentAxis: {
                visible: false,
                tick: {
                    visible: false
                },
                label: {
                    visible: false
                },
                startAngle: 90,
                tickInterval: 30
            },
    
            valueAxis: {
                label: {visible: false},
                grid: {visible: false},
                tick: {visible: false},
                minorGrid: {visible: false},
                minorTick: {visible: false},
                maxValueMargin: 0.05,
                constantLines: constantLines
            },
            legend: {
                visible: false
            },
            margin: {
                top: 30
            },
            tooltip: {
                enabled: true,
                customizeTooltip: function (e) {
                    return {text: `${e.point.data.tooltipData}%`};
                }
            },

            customizePoint: function(e) {
                let color = '#5CA2DC';
                if (e.data.value == 100) color = '#39bb9d';
                else if (e.data.value == -20) color = '#ef435a';
                return {color: color};
            },
            customizeLabel: function () {
                return {
                    backgroundColor: 'rgba(242, 245, 251, 0.5)',
                    font: {
                        color: '#595d6e'
                    },
                    position: 'outside',
                    visible: true,
                    format: "",
                    connector: {
                        visible: true
                    },
                    customizeText: (e)=> {
                        return e.argument;
                        
                    }
                }
            },
            onPointClick: function(e) {
                let arr = `${e.target.data.tooltipData}`.split('\n')
                if (arr[0] == e.target.argument) {
                    e.target.data.tooltipData = `${arr[2]}`;
                } else {
                    e.target.data.tooltipData = `${e.target.argument}\n⠀\n${e.target.data.tooltipData}`;
                }

                e.target.hideTooltip();
                e.target.showTooltip();
            }
        });
    
        $("#rangeSelector").dxRangeSelector({
            size: {
                height: 100
            },
            margin: {
                top: 10,
                left: 60,
                bottom: 10,
                right: 50
            },
            scale: {
                startValue: -50,
                endValue: 100,
                minorTickInterval: 1,
                tickInterval: 5,
                minorTick: {
                    visible: false
                }
            },
            behavior: {
                callValueChanged: "onMoving"
            },
            onValueChanged: function (e) {
                var zoomedChart = $("#zoomedChart").dxPolarChart("instance");
                zoomedChart.getValueAxis().visualRange(e.value);
            }
        });
        setHeightBlock();
    });
}

function setHeightBlock() {
    const height = document.querySelector('.zoom_chart').offsetHeight - document.getElementById('rangeSelector').offsetHeight;
    document.getElementById('tab7_2_graph').style.height = `${height}px`;
}

function DrillDownRegionAndQuarterInterval(ctrl)
{
    document.querySelector('.header-switch').style.display = 'none';
    let id_region = $(ctrl).data('id-region');
    let v;

    for (v of dataSource1_data_y) if (v.id_region == parseInt(id_region)) $('#tab7_2_header h2 span').text(v.region);
    $('#tab7_1_header, #tab7_1_paginator, #tab7_1_selector, #tab7_1_content').hide();
    $('#tab7_2_header, #tab7_2_content').show();
    let url_true = now_page == ''? 'modalgraph': 'alt';
    $.ajax({
        url: `/raiting/${url_true}/`,
        method: "POST",
        data: {
            region: id_region
        },
        success: (data) => {
            dataSource2_data_y = data.data_reg;
            RedrawGraphs2_1(id_region);
            add_event_req_zoom();
        },
        error: () => {
            alert('Ошибка запроса выполнения!')
        }
    });
}

function BackToAggregateByRegion()
{
    document.querySelector('.header-switch').style.display = 'block';
    $('#tab7_1_header, #tab7_1_paginator, #tab7_1_selector, #tab7_1_content').show();
    $('#tab7_2_header, #tab7_2_content').hide();
    setTimeout(function() {
        $('[id^="chart1-"]').each(function() {
            $(this).dxChart('instance').render();
        });
    }, 150);
}

function SetQuarterInterval(ctrl)
{
    if ($(ctrl).hasClass('active')) $(ctrl).removeClass('active');
    else
    {
        let $limits = $('#tab7_1_selector .active');
        if ($limits.length >= 2)
        {
            $limits.removeClass('active');
            $('#tab7_1_selector .interval-between-limits').removeClass('#tab7_1_selector interval-between-limits');
        }

        $(ctrl).addClass('active');
    }

    CalculateTempoAndIncrement1();
}

function SetIntervalOnHover(o)
{
    let $limits = $('#tab7_1_selector .active');
    let l = $limits.length;
    let q1, q2, q_tmp;

    if (l != 1) return;
    q1 = $limits.data('quarter');
    q2 = $(o).data('quarter');
    if (q1 > q2)
    {
        q_tmp = q1;
        q1 = q2;
        q2 = q_tmp;
    }

    $('#tab7_1_selector [data-quarter]').each(function() {
        let q = $(this).data('quarter');
        if (q <= q1 || q >= q2) $(this).removeClass('interval-between-limits'); else $(this).addClass('interval-between-limits');
    });
}

function CalculateTempoAndIncrement1()
{
    let q1 = null, q2 = null, q, q_tmp, val1, val2, v1, i;
    let $limits = $('#tab7_1_selector .active');
    let l = $limits.length;

    if (!l || l == 2)
    {
        if (!l) $limits = $('#tab7_1_selector [data-quarter]');
        q1 = $limits.first().data('quarter');
        q2 = $limits.last().data('quarter');

        if (q1 > q2)
        {
            q_tmp = q1;
            q1 = q2;
            q2 = q_tmp;
        }
    
        //Цикл расчета по регионам
        for (v1 of dataSource1_data_y)
        {
            //Цикл по кварталам
            for (i in dataSource_data_x)
            {
                q_tmp = dataSource_data_x[i];
                if (q1 == q_tmp) val1 = v1.graph_data[i]; //Точка "было"
                if (q2 == q_tmp) val2 = v1.graph_data[i]; //Точка "стало"
            }
            //---------------

            //Расчет показателей
            let delta = val2 - val1;
            let abs_delta = Math.abs(delta);
            let sign = (delta > 0 ? '&#9660;' : (delta < 0 ? '&#9650;' : '&#9632;'));
            let cl = (delta > 0 ? 'tendence-plus' : (delta < 0 ? 'tendence-minus' : 'tendence-same'));
            let ind1 = '<span class="' + cl + ' all_num">' + sign + '<span class="num_black"> ' + Math.round(abs_delta / val1 * 100, 0) + '% </span></span>';
            let ind2 = '<span class="' + cl + ' all_num">' + sign + '<span class="num_black"> ' + abs_delta + '</span></span>';
            $('#tab7_1_graph [data-id-region="' + v1.id_region + '"] .value-cell .rel-value').html(ind1);
            $('#tab7_1_graph [data-id-region="' + v1.id_region + '"] .value-cell .abs-value').html(ind2);
            //---------------
        }
        //---------------
    }
    else
    {
        $('#tab7_1_graph .value-cell .rel-value, #tab7_1_graph .value-cell .abs-value').html('&#8943;');
        return;
    }
}

function SelectQuarterForRadar(ctrl)
{
    $('#tab7_2_selector button').removeClass('active');
    $(ctrl).addClass('active');
    RedrawGraphs2_2($(ctrl).data('id-region'), $(ctrl).data('quarter'));
}

function ScrollYear(ctrl)
{
    let i, i2, tmp, year;

    year = $(ctrl).text();

    for (i = 0, i2 = -1; i < dataSource_data_x.length; i++)
    {
        tmp = dataSource_data_x[i].split('-');
        if (year == tmp[0]) i2 = i;
    }

    if (i2 < 0) return;
    else if (i2 < 7) i2 = 7;

    $('#dd_year').text(year);
    RedrawGraphs1(dataSource_data_x[i2], year);
    CalculateTempoAndIncrement1();
}



$(document).ready(function() {
    document.getElementById('switch-a').addEventListener('click', switch_control);
    sendPageAjax();
});

function switch_control() {
    if (this.innerHTML.toUpperCase() == 'ТРАДИЦИОННЫЕ ПОКАЗАТЕЛИ') {
        this.innerHTML = 'АЛЬТЕРНАТИВНЫЕ ПОКАЗАТЕЛИ';
        now_page = 'alt/';
    } else {
        this.innerHTML = 'ТРАДИЦИОННЫЕ ПОКАЗАТЕЛИ';
        now_page = '';
    }
    sendPageAjax();
}

function sendPageAjax() {
    let method = now_page == ''? 'POST': 'GET';
    $.ajax({
        url: `/raiting/${now_page}`,
        method: method,
        success: (data) => {
            dataSource_data_x = data.data_x;
            dataSource1_data_y = data.data_y;
            setTimeout(function() {
                let html = '', tmp, year_prev = '', i;
                for (i in dataSource_data_x)
                {
                    tmp = dataSource_data_x[i].split('-');
                    if (!i || tmp[0] != year_prev)
                    {
                        html += '<button class="dropdown-item" type="button" data-click-function="ScrollYear">' + tmp[0] + '</button>';
                        year_prev = tmp[0];
                    }

                    $('#tab7_1_selector .dropdown .dropdown-menu').html(html);
                    setTimeout(function() {
                        $('#dd_year').text(tmp[0]).attr('data-toggle', 'dropdown').data('toggle', 'dropdown').dropdown();
                    }, 150);
                }

                RedrawGraphs1(dataSource_data_x[i], tmp[0]);
                CalculateTempoAndIncrement1();
                $('[id^="tab7_2_header"]').hide();
            }, 250);
        },
        error: () => {
            alert('Ошибка запроса выполнения!')
        }
    });
}

function add_event_req_zoom() {
    document.querySelectorAll('.region_for_zoom').forEach((el) => {
        el.addEventListener('click', ()=> {
            let req = el.firstChild.innerHTML;
            var zoomedChart = $("#zoomedChart").dxPolarChart("instance");
            zoomedChart.getSeriesByPos(0).getAllPoints().forEach((el) => {
                if (el.argument == req) {
                    el.select();
                }
            })
        })
    })
}