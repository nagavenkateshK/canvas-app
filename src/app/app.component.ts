import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'canvas-app';
  showTemplate = true;

  @ViewChild('myCanvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  images: any[] = [];

  context: any;

  containers: any[] = [];
  constrain = false;
  min_width = 60;
  min_height = 60;
  max_width = 800;
  max_height = 900;
  resize_canvas = document.createElement('canvas');

  resizeListner: any = () => { };;
  endResizeListner: any = () => { };;
  renderer: any;
  elementRef: any;

  constructor(elementRef: ElementRef, renderer: Renderer2) {
    this.renderer = renderer;
    this.elementRef = elementRef;
  }


  ngAfterViewInit(): void {
  }

  handleImage(e: any) {
    this.images = [];
    this.context = this.canvas.nativeElement.getContext('2d');
    var canvas: any = this.canvas;
    var ctx = this.context;
    var images = this.images;
    const tempComp = this;
    for (let i = 0; i < e.target.files.length; i++) {
      var reader = new FileReader();
      reader.onload = function (event: any) {
        images.push({ img: event.target.result, id: 'img' + i,name:e.target.files[i].name })
        var img = new Image();
        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          tempComp.resizeableImage('img'+i);
        }
        img.src = event.target.result;
        img.id = 'img' + i;
      }
      reader.readAsDataURL(e.target.files[i]);
    }
  }

  resizeableImage(imgId: any) {

    const image_target: any = document.getElementById(imgId)
    const orig_src = new Image()
    orig_src.src = image_target.src;
    const tempComp = this;
    const event_state: any = {};

    const currentContainer: any = document.getElementById(imgId)?.closest(".resize-container")
    const corners: any = [...currentContainer.getElementsByClassName('resize-handle')];
    corners.forEach((corner: any) => {
      corner.addEventListener('mousedown', (event: MouseEvent) => {
        tempComp.startResize(event, tempComp, currentContainer, orig_src, event_state, image_target)
      })
    });

    const images: any = [...currentContainer.getElementsByTagName('img')];
    images.forEach((image: any) => {
      image.addEventListener('mousedown', (event: MouseEvent) => {
        tempComp.startMoving(event, tempComp, currentContainer, orig_src, event_state, image_target)
      })
    });
  };

  startResize(e: any, tempComp: any, container: any, orig_src: any, event_state: any, image_target: any) {
    e.preventDefault();
    e.stopPropagation();
    tempComp.saveEventState(e, container, event_state);

    this.resizeListner = tempComp.renderer.listen(tempComp.elementRef.nativeElement, 'mousemove', (event: any) => {
      this.resizing(event, container, orig_src, event_state, image_target);
    })
    this.endResizeListner = tempComp.renderer.listen(tempComp.elementRef.nativeElement, 'mouseup', (event: any) => {
      this.endResize(event);
    })
  };

  endResize(e: any) {
    e.preventDefault();
    this.resizeListner();
    this.endResizeListner();
  };

  startMoving(e: any, tempComp: any, container: any, orig_src: any, event_state: any, image_target: any) {
    e.preventDefault();
    e.stopPropagation();
    tempComp.saveEventState(e, container, event_state);
    this.resizeListner = tempComp.renderer.listen(tempComp.elementRef.nativeElement, 'mousemove', (event: any) => {
      this.moving(event, container, event_state);
    })
    this.endResizeListner = tempComp.renderer.listen(tempComp.elementRef.nativeElement, 'mouseup', (event: any) => {
      this.endMoving(event);
    })
  };

  endMoving(e: any) {
    e.preventDefault();
    this.resizeListner();
    this.endResizeListner();
  };

  moving(e: any, container: any, event_state: any) {

    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    var scrollLeft = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    var mouse: any = {};
    e.preventDefault();
    e.stopPropagation();
    mouse.x = (e.clientX || e.pageX) + scrollLeft;
    mouse.y = (e.clientY || e.pageY) + scrollTop;
    container.style.left = mouse.x - (event_state.mouse_x - event_state.container_left);
    container.style.top = mouse.y - (event_state.mouse_y - event_state.container_top);
  };

  saveEventState(e: any, container: any, event_state: any) {
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    var scrollLeft = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
    event_state.container_width = container.offsetWidth;
    event_state.container_height = container.offsetHeight;
    event_state.container_left = container.offsetLeft;
    event_state.container_top = container.offsetTop;
    event_state.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + scrollLeft;
    event_state.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + scrollTop;

   
    if (typeof e.originalEvent?.touches !== 'undefined') {
      event_state.touches = [];
      e.originalEvent.touches.forEach((ob: any, i: any) => {
        event_state.touches[i] = {};
        event_state.touches[i].clientX = 0 + ob.clientX;
        event_state.touches[i].clientY = 0 + ob.clientY;
      });
    }
    event_state.evnt = e;
  }

  resizing(e: any, container: any, orig_src: any, event_state: any, image_target: any) {
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    var scrollLeft = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    var mouse: any = {}, width: any, height: any, left: any, top: any;
    mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + scrollLeft;
    mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + scrollTop;

    if (event_state.evnt.target.classList.contains('resize-handle-se')) {
      width = mouse.x - event_state.container_left;
      height = mouse.y - event_state.container_top;
      left = event_state.container_left;
      top = event_state.container_top;
    } else if (event_state.evnt.target.classList.contains('resize-handle-sw')) {
      width = event_state.container_width - (mouse.x - event_state.container_left);
      height = mouse.y - event_state.container_top;
      left = mouse.x;
      top = event_state.container_top;
    } else if (event_state.evnt.target.classList.contains('resize-handle-nw')) {
      width = event_state.container_width - (mouse.x - event_state.container_left);
      height = event_state.container_height - (mouse.y - event_state.container_top);
      left = mouse.x;
      top = mouse.y;
      if (this.constrain || e.shiftKey) {
        top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
      }
    } else if (event_state.evnt.target.classList.contains('resize-handle-ne')) {
      width = mouse.x - event_state.container_left;
      height = event_state.container_height - (mouse.y - event_state.container_top);
      left = event_state.container_left;
      top = mouse.y;
      if (this.constrain || e.shiftKey) {
        top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
      }
    }
    if (this.constrain || e.shiftKey) {
      height = width / orig_src.width * orig_src.height;
    }

    if (width > this.min_width && height > this.min_height && width < this.max_width && height < this.max_height) {
      this.resizeImage(width, height, orig_src, image_target, left, top);
      container.style.left = left;
      container.style.top = top;
    }


  }

  resizeImage(width: any, height: any, orig_src: any, image_target: any, left: any, top: any) {
    this.resize_canvas.width = width;
    this.resize_canvas.height = height;
    this.resize_canvas.getContext('2d')?.drawImage(orig_src, 0, 0, width, height);
    image_target.src = this.resize_canvas.toDataURL("image/png")
  };

}
