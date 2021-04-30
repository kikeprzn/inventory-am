function range(start, end, step) {
    var _end = end || start;
    var _start = end ? start : 0;
    var _step = step || 1;
    return Array((_end - _start) / _step).fill(0).map((v, i) => _start + (i * _step));
}

function getPages(total_pages, current_page){
    let result = {} 
    let pages = []
    if (total_pages <= 11 || current_page <= 6){
        // pages = [x for x in range(1, min(total_pages + 1, 12))]
        range(1, Math.min(total_pages + 1, 12)).forEach(item => {
            pages.push(item)
        });
        
    } 
    else if (current_page > total_pages - 6){
        // pages = [x for x in range(total_pages - 10, total_pages + 1)]
        range(total_pages - 10, total_pages + 1).forEach(item => {
            pages.push(item)
        });
    }
    else{
        // pages = [x for x in range(current_page - 5, current_page + 6)]
        range(current_page - 5, current_page + 6).forEach(item => {
            pages.push(item)
        });
    }
    result.has_prev = false;
    result.has_next = false;
    result.pages_showed = pages;
    
    if (pages.length > 0){
        result.has_prev = (pages[0] == current_page) ? false : true;
        result.has_next = (pages[pages.length - 1] == current_page) ? false : true;
    }
    
    return result;
    
}
const paginate = ({ page, pageSize }) => {
    const offset = page * pageSize;
    const limit = pageSize;
  
    return {
      offset,
      limit,
    };
};

module.exports = {getPages, paginate}
